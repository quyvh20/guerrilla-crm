package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"time"

	"guerrilla-crm/database"
	"guerrilla-crm/models"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	database.ConnectDb()

	app := fiber.New()
	app.Use(cors.New())

	app.Post("/api/customers", func(c *fiber.Ctx) error {
		customer := new(models.Customer)
		if err := c.BodyParser(customer); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		if err := database.DB.Create(customer).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusCreated).JSON(customer)
	})

	app.Get("/api/customers", func(c *fiber.Ctx) error {
		var customers []models.Customer
		q := database.DB.Order("last_contact_at desc")
		if phone := c.Query("phone"); phone != "" {
			q = q.Where("phone LIKE ?", "%"+phone+"%")
		}
		if err := q.Find(&customers).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(customers)
	})

	app.Get("/api/customers/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var customer models.Customer
		if err := database.DB.Preload("Interactions").Preload("ValueLedgers").First(&customer, "id = ?", id).Error; err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Customer not found"})
		}
		return c.JSON(customer)
	})

	app.Post("/api/interactions/analyze", func(c *fiber.Ctx) error {
		var body struct {
			CustomerID string `json:"customer_id"`
			Channel    string `json:"channel"`
			ChatContent string `json:"chat_content"`
		}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}

		aiWorkerURL := os.Getenv("AI_WORKER_URL")
		payload, _ := json.Marshal(map[string]string{"chatContent": body.ChatContent})
		resp, err := http.Post(aiWorkerURL, "application/json", bytes.NewBuffer(payload))
		if err != nil {
			return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"error": "AI Worker unreachable: " + err.Error()})
		}
		defer resp.Body.Close()
		respBytes, _ := io.ReadAll(resp.Body)

		var aiResult struct {
			Intent     string `json:"intent"`
			Budget     int    `json:"budget"`
			AiSummary  string `json:"ai_summary"`
			Sentiment  string `json:"sentiment"`
			SalesScore int    `json:"sales_score"`
		}
		if err := json.Unmarshal(respBytes, &aiResult); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to parse AI response: " + err.Error()})
		}

		customerUUID, err := uuid.Parse(body.CustomerID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid customer_id"})
		}

		interaction := models.Interaction{
			CustomerID: customerUUID,
			Channel:    body.Channel,
			RawContent: body.ChatContent,
			AiSummary:  aiResult.AiSummary,
			Sentiment:  aiResult.Sentiment,
			SalesScore: aiResult.SalesScore,
		}

		tx := database.DB.Begin()
		if err := tx.Create(&interaction).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		updates := map[string]interface{}{
			"last_contact_at": time.Now(),
		}
		if aiResult.Intent != "" {
			updates["intent"] = aiResult.Intent
		}
		if aiResult.Budget > 0 {
			updates["budget"] = aiResult.Budget
		}
		if err := tx.Model(&models.Customer{}).Where("id = ?", customerUUID).Updates(updates).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		tx.Commit()

		return c.Status(fiber.StatusCreated).JSON(interaction)
	})

	app.Post("/api/interactions", func(c *fiber.Ctx) error {
		var payload struct {
			CustomerID string `json:"customer_id"`
			Channel    string `json:"channel"`
			RawContent string `json:"raw_content"`
			AiSummary  string `json:"ai_summary"`
			Sentiment  string `json:"sentiment"`
			SalesScore int    `json:"sales_score"`
			// Các trường Profile mở rộng
			Email      string `json:"email"`
			Address    string `json:"address"`
			JobTitle   string `json:"job_title"`
			Company    string `json:"company"`
			Source     string `json:"source"`
			Tags       string `json:"tags"`
			Intent     string `json:"intent"`
			PainPoints string `json:"pain_points"`
			Budget     int    `json:"budget"`
		}

		if err := c.BodyParser(&payload); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}

		customerUUID, err := uuid.Parse(payload.CustomerID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid customer_id"})
		}

		interaction := models.Interaction{
			CustomerID: customerUUID,
			Channel:    payload.Channel,
			RawContent: payload.RawContent,
			AiSummary:  payload.AiSummary,
			Sentiment:  payload.Sentiment,
			SalesScore: payload.SalesScore,
		}

		tx := database.DB.Begin()
		if err := tx.Create(&interaction).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		// Cập nhật Hồ Sơ Khách Hàng (Rich Profile)
		updates := map[string]interface{}{
			"last_contact_at": time.Now(),
		}
		if payload.Email != "" {
			updates["email"] = payload.Email
		}
		if payload.Address != "" {
			updates["address"] = payload.Address
		}
		if payload.JobTitle != "" {
			updates["job_title"] = payload.JobTitle
		}
		if payload.Company != "" {
			updates["company"] = payload.Company
		}
		if payload.Source != "" {
			updates["source"] = payload.Source
		}
		if payload.Tags != "" {
			updates["tags"] = payload.Tags
		}
		if payload.Intent != "" {
			updates["intent"] = payload.Intent
		}
		if payload.PainPoints != "" {
			updates["pain_points"] = payload.PainPoints
		}
		if payload.Budget > 0 {
			updates["budget"] = payload.Budget
		}

		if err := tx.Model(&models.Customer{}).Where("id = ?", customerUUID).Updates(updates).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		tx.Commit()
		return c.Status(fiber.StatusCreated).JSON(interaction)
	})

	app.Post("/api/ledgers", func(c *fiber.Ctx) error {
		ledger := new(models.ValueLedger)
		if err := c.BodyParser(ledger); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		if err := database.DB.Create(ledger).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusCreated).JSON(ledger)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	app.Listen(":" + port)
}
