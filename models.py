from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Date, JSON
from datetime import date


class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

class WarframeData(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    WFname: Mapped[str] = mapped_column(unique=True, nullable=False)
    WFtype: Mapped[str] = mapped_column(nullable=False)
    health: Mapped[int] = mapped_column(nullable=False)
    shield: Mapped[int | None] = mapped_column(nullable=True)
    armor: Mapped[int] = mapped_column(nullable=True)
    power: Mapped[int] = mapped_column(nullable=True)
    sprintSpeed: Mapped[int] = mapped_column(nullable=True)
    releaseDate: Mapped[date | None] = mapped_column(Date, nullable=True)
    description: Mapped[str] = mapped_column(nullable=False)
    abilities1: Mapped[str] = mapped_column(nullable=False)
    description1: Mapped[str] = mapped_column(nullable=False)
    abilities2: Mapped[str] = mapped_column(nullable=False)
    description2: Mapped[str] = mapped_column(nullable=False)
    abilities3: Mapped[str] = mapped_column(nullable=False)
    description3: Mapped[str] = mapped_column(nullable=False)
    abilities4: Mapped[str] = mapped_column(nullable=False)
    description4: Mapped[str] = mapped_column(nullable=False)    

class ModData(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True, nullable=False)
    type: Mapped[str] = mapped_column(nullable=False)
    baseDrain: Mapped[int] = mapped_column(nullable=False)
    fusionLimit: Mapped[int] = mapped_column(nullable=False)
    rarity: Mapped[str] = mapped_column(nullable=False)
    polarity: Mapped[str] = mapped_column(nullable=False)
    tradable: Mapped[bool] = mapped_column(nullable=False)
    releaseDate: Mapped[date] = mapped_column(nullable=False)
    wikiAvailable: Mapped[bool] = mapped_column(nullable=True)
    wikiaUrl: Mapped[str] = mapped_column(nullable=True)

class ArcaneData(db.Model):
    __tablename__ = "arcanes"   

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True, nullable=False)
    category: Mapped[str] = mapped_column(nullable=False)
    type: Mapped[str] = mapped_column(nullable=False)
    rarity: Mapped[str] = mapped_column(nullable=False)
    tradable: Mapped[bool] = mapped_column(nullable=False)
    level0: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    level1: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    level2: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    level3: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    level4: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    level5: Mapped[dict | None] = mapped_column(JSON, nullable=True)


def create_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()