from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, security
from app.database import get_db

router = APIRouter()

@router.post("/exchanges/", response_model=schemas.Exchange)
def create_exchange(exchange: schemas.ExchangeCreate, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    book_offered = db.query(models.Book).filter(models.Book.id == exchange.book_offered_id).first()
    book_requested = db.query(models.Book).filter(models.Book.id == exchange.book_requested_id).first()
    if not book_offered or not book_requested:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    if book_offered.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para ofrecer este libro")
    if book_requested.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes solicitar tu propio libro")
    db_exchange = models.Exchange(**exchange.dict(), offering_user_id=current_user.id, requesting_user_id=book_requested.user_id)
    db.add(db_exchange)
    db.commit()
    db.refresh(db_exchange)
    return db_exchange

@router.put("/exchanges/{exchange_id}", response_model=schemas.Exchange)
def update_exchange(exchange_id: int, exchange: schemas.ExchangeUpdate, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_exchange = db.query(models.Exchange).filter(models.Exchange.id == exchange_id).first()
    if not db_exchange:
        raise HTTPException(status_code=404, detail="Intercambio no encontrado")
    if db_exchange.offering_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para actualizar este intercambio")
    if db_exchange.status not in ["pending", "accepted", "rejected", "completed"]:
        raise HTTPException(status_code=400, detail="Estado de intercambio inválido")

    if db_exchange.status == "completed":
        raise HTTPException(status_code=400, detail="El intercambio ya está completado")

    db_exchange.status = exchange.status
    db.commit()
    db.refresh(db_exchange)
    return db_exchange

@router.put("/exchanges/{exchange_id}/accept/", response_model=schemas.Exchange)
def accept_exchange(exchange_id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_exchange = db.query(models.Exchange).filter(models.Exchange.id == exchange_id).first()
    if not db_exchange:
        raise HTTPException(status_code=404, detail="Intercambio no encontrado")
    if db_exchange.requesting_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para aceptar este intercambio")
    if db_exchange.status != "pending":
        raise HTTPException(status_code=400, detail="El intercambio no está pendiente")
    db_exchange.status = "accepted"
    db.commit()
    db.refresh(db_exchange)
    return db_exchange

@router.put("/exchanges/{exchange_id}/confirm_offered_book_delivery/", response_model=schemas.Exchange)
def confirm_offered_book_delivery(exchange_id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_exchange = db.query(models.Exchange).filter(models.Exchange.id == exchange_id).first()
    if not db_exchange:
        raise HTTPException(status_code=404, detail="Intercambio no encontrado")
    if db_exchange.offering_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para confirmar la entrega del libro ofrecido")
    if db_exchange.status != "accepted":
        raise HTTPException(status_code=400, detail="El intercambio no está aceptado")
    db_exchange.offered_book_delivered = True
    db.commit()
    db.refresh(db_exchange)
    return db_exchange

@router.put("/exchanges/{exchange_id}/confirm_requested_book_delivery/", response_model=schemas.Exchange)
def confirm_requested_book_delivery(exchange_id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_exchange = db.query(models.Exchange).filter(models.Exchange.id == exchange_id).first()
    if not db_exchange:
        raise HTTPException(status_code=404, detail="Intercambio no encontrado")
    if db_exchange.requesting_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para confirmar la entrega del libro solicitado")
    if db_exchange.status != "accepted":
        raise HTTPException(status_code=400, detail="El intercambio no está aceptado")
    db_exchange.requested_book_delivered = True
    db.commit()
    db.refresh(db_exchange)
    return db_exchange

@router.put("/exchanges/{exchange_id}/finish/", response_model=schemas.Exchange)
def finish_exchange(exchange_id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_exchange = db.query(models.Exchange).filter(models.Exchange.id == exchange_id).first()
    if not db_exchange:
        raise HTTPException(status_code=404, detail="Intercambio no encontrado")
    if db_exchange.offering_user_id != current_user.id and db_exchange.requesting_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para finalizar este intercambio")
    if not db_exchange.offered_book_delivered or not db_exchange.requested_book_delivered:
        raise HTTPException(status_code=400, detail="Ambos libros deben ser entregados para finalizar el intercambio")
    db_exchange.status = "completed"
    db.commit()
    db.refresh(db_exchange)
    return db_exchange

@router.put("/exchanges/{exchange_id}/cancel/", response_model=schemas.Exchange)
def cancel_exchange(exchange_id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    db_exchange = db.query(models.Exchange).filter(models.Exchange.id == exchange_id).first()
    if not db_exchange:
        raise HTTPException(status_code=404, detail="Intercambio no encontrado")
    if db_exchange.offering_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado para cancelar este intercambio")
    if db_exchange.status != "pending":
        raise HTTPException(status_code=400, detail="Solo se pueden cancelar intercambios pendientes")
    db_exchange.status = "cancelled"
    db.commit()
    db.refresh(db_exchange)
    return db_exchange

@router.get("/exchanges/", response_model=List[schemas.Exchange])
def read_exchanges(current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    exchanges = db.query(models.Exchange).filter((models.Exchange.offering_user_id == current_user.id) | (models.Exchange.requesting_user_id == current_user.id)).all()
    return exchanges

@router.get("/exchanges/history/", response_model=List[schemas.ExchangeHistory])
def read_exchange_history(current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    exchange_history = db.query(models.ExchangeHistory).join(models.Exchange).filter(
        (models.Exchange.offering_user_id == current_user.id) | (models.Exchange.requesting_user_id == current_user.id)
    ).all()
    return exchange_history