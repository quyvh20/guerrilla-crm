package database

import (
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"guerrilla-crm/models"
)

var DB *gorm.DB

func ConnectDb() {
	dsn := os.Getenv("DATABASE_URL")
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	err = db.AutoMigrate(
		&models.User{},
		&models.Customer{},
		&models.Interaction{},
		&models.ValueLedger{},
		&models.Task{},
	)
	if err != nil {
		panic(err)
	}

	DB = db
}
