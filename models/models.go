package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Email     string    `gorm:"unique;not null" json:"email"`
	Role      string    `gorm:"default:'SALES'" json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

type Customer struct {
	ID            uuid.UUID     `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Name          string        `gorm:"not null" json:"name"`
	Phone         string        `gorm:"unique;not null" json:"phone"`
	Email         string        `json:"email"`
	Address       string        `json:"address"`
	JobTitle      string        `json:"job_title"`
	Company       string        `json:"company"`
	Source        string        `json:"source"`
	Tags          string        `json:"tags"`
	PainPoints    string        `json:"pain_points"`
	Intent        string        `json:"intent"`
	Budget        int           `json:"budget"`
	Status        string        `gorm:"default:'NEW'" json:"status"`
	HealthScore   int           `gorm:"default:100" json:"health_score"`
	NextActionAt  *time.Time    `json:"next_action_at"`
	LastContactAt time.Time     `json:"last_contact_at"`
	CreatedAt     time.Time     `json:"created_at"`
	Interactions  []Interaction `gorm:"foreignKey:CustomerID" json:"interactions,omitempty"`
	ValueLedgers  []ValueLedger `gorm:"foreignKey:CustomerID" json:"value_ledgers,omitempty"`
}

type Interaction struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerID uuid.UUID `gorm:"type:uuid;not null;index" json:"customer_id"`
	Channel    string    `gorm:"not null" json:"channel"`
	RawContent string    `json:"raw_content"`
	AiSummary  string    `json:"ai_summary"`
	Sentiment  string    `json:"sentiment"`
	SalesScore int       `json:"sales_score"`
	CreatedAt  time.Time `json:"created_at"`
}

type ValueLedger struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerID uuid.UUID `gorm:"type:uuid;not null;index" json:"customer_id"`
	Activity   string    `gorm:"not null" json:"activity"`
	Cost       int       `json:"cost"`
	Impact     string    `json:"impact"`
	CreatedAt  time.Time `json:"created_at"`
}

type Task struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomerID  uuid.UUID `gorm:"type:uuid;not null;index" json:"customer_id"`
	AssigneeID  uuid.UUID `gorm:"type:uuid" json:"assignee_id"`
	Title       string    `gorm:"not null" json:"title"`
	DueDate     time.Time `json:"due_date"`
	IsCompleted bool      `gorm:"default:false" json:"is_completed"`
	CreatedAt   time.Time `json:"created_at"`
}
