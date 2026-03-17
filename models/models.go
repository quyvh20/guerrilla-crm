package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	Email          string    `gorm:"unique;not null" json:"email"`
	Role           string    `gorm:"default:'SALES'" json:"role"`
	ExtensionToken string    `gorm:"unique" json:"extension_token"`
	CreatedAt      time.Time `json:"created_at"`
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

// CustomObject represents a user-defined entity type (e.g. "Product", "Deal")
// Each user can create their own objects independently
type CustomObject struct {
	ID          uuid.UUID     `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	UserID      uuid.UUID     `gorm:"type:uuid;not null;index" json:"user_id"`
	Name        string        `gorm:"not null" json:"name"`
	Description string        `json:"description"`
	CreatedAt   time.Time     `json:"created_at"`
	Fields      []CustomField `gorm:"foreignKey:CustomObjectID" json:"fields,omitempty"`
}

// CustomField represents a single field within a CustomObject
type CustomField struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CustomObjectID uuid.UUID `gorm:"type:uuid;not null;index" json:"custom_object_id"`
	Name           string    `gorm:"not null" json:"name"`
	FieldType      string    `gorm:"not null;default:'STRING'" json:"field_type"` // STRING, NUMBER, BOOLEAN
	IsRequired     bool      `gorm:"default:false" json:"is_required"`
	CreatedAt      time.Time `json:"created_at"`
}

// CustomFieldValue stores the actual data for a custom field on a specific record
type CustomFieldValue struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	RecordID      uuid.UUID `gorm:"type:uuid;not null;index" json:"record_id"`      // The entity this value belongs to (e.g. Customer UUID)
	CustomFieldID uuid.UUID `gorm:"type:uuid;not null;index" json:"custom_field_id"`
	ValueString   string    `json:"value_string"`
	ValueNumber   float64   `json:"value_number"`
	CreatedAt     time.Time `json:"created_at"`
}
