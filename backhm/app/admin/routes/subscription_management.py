from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.connection import get_db
from app.models.base import SubscriptionPlan, Payment, User
from app.models.base_models import (
    SubscriptionPlanCreate, 
    SubscriptionPlanResponse, 
    SubscriptionPlanUpdate,
    PaymentCreate,
    PaymentResponse,
    PaymentDetailResponse,
    PaymentUpdate
)

# Define the router with the correct name that matches the import in admin.py
subscription_router = APIRouter()

# Subscription Plan Management
@subscription_router.post("/plans", response_model=SubscriptionPlanResponse, status_code=status.HTTP_201_CREATED)
def create_subscription_plan(plan: SubscriptionPlanCreate, db: Session = Depends(get_db)):
    """
    Create a new subscription plan (Admin only)
    """
    db_plan = SubscriptionPlan(
        plan_name=plan.plan_name,
        price_per_interview=plan.price_per_interview,
        max_interviews=plan.max_interviews,
        activity_type=plan.activity_type
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@subscription_router.get("/plans", response_model=List[SubscriptionPlanResponse])
def list_subscription_plans(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    List all subscription plans (Admin only)
    """
    plans = db.query(SubscriptionPlan).offset(skip).limit(limit).all()
    return plans

@subscription_router.get("/plans/{plan_id}", response_model=SubscriptionPlanResponse)
def get_subscription_plan(plan_id: int, db: Session = Depends(get_db)):
    """
    Get details of a specific subscription plan (Admin only)
    """
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.plan_id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription plan with ID {plan_id} not found"
        )
    return plan

@subscription_router.put("/plans/{plan_id}", response_model=SubscriptionPlanResponse)
def update_subscription_plan(
    plan_id: int, 
    plan_update: SubscriptionPlanUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a subscription plan (Admin only)
    """
    db_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.plan_id == plan_id).first()
    if not db_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription plan with ID {plan_id} not found"
        )
    
    # Update only provided fields
    update_data = plan_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_plan, key, value)
    
    db.commit()
    db.refresh(db_plan)
    return db_plan

@subscription_router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subscription_plan(plan_id: int, db: Session = Depends(get_db)):
    """
    Delete a subscription plan (Admin only)
    """
    db_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.plan_id == plan_id).first()
    if not db_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription plan with ID {plan_id} not found"
        )
    
    # Check if there are any payments associated with this plan
    payments = db.query(Payment).filter(Payment.plan_id == plan_id).first()
    if payments:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete plan with ID {plan_id} as it has associated payments"
        )
    
    db.delete(db_plan)
    db.commit()
    return None

# Payment Management
@subscription_router.post("/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    """
    Record a new payment (Admin only)
    """
    # Verify user exists
    user = db.query(User).filter(User.user_id == payment.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {payment.user_id} not found"
        )
    
    # Verify plan exists
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.plan_id == payment.plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subscription plan with ID {payment.plan_id} not found"
        )
    
    db_payment = Payment(
        user_id=payment.user_id,
        plan_id=payment.plan_id,
        amount_paid=payment.amount_paid,
        status=payment.status,
        activity_type=payment.activity_type
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@subscription_router.get("/payments", response_model=List[PaymentResponse])
def list_payments(
    skip: int = 0, 
    limit: int = 100, 
    user_id: Optional[int] = None,
    plan_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all payments with optional filtering (Admin only)
    """
    query = db.query(Payment)
    
    if user_id:
        query = query.filter(Payment.user_id == user_id)
    if plan_id:
        query = query.filter(Payment.plan_id == plan_id)
    if status:
        query = query.filter(Payment.status == status)
    
    payments = query.order_by(Payment.payment_date.desc()).offset(skip).limit(limit).all()
    return payments

@subscription_router.get("/payments/{payment_id}", response_model=PaymentDetailResponse)
def get_payment_details(payment_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific payment (Admin only)
    """
    payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with ID {payment_id} not found"
        )
    return payment

@subscription_router.put("/payments/{payment_id}", response_model=PaymentResponse)
def update_payment_status(
    payment_id: int, 
    payment_update: PaymentUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update payment status (Admin only)
    """
    db_payment = db.query(Payment).filter(Payment.payment_id == payment_id).first()
    if not db_payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payment with ID {payment_id} not found"
        )
    
    # Update only provided fields
    update_data = payment_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_payment, key, value)
    
    db.commit()
    db.refresh(db_payment)
    return db_payment

@subscription_router.get("/analytics/revenue", response_model=dict)
def get_revenue_analytics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """
    Get revenue analytics for subscription plans (Admin only)
    """
    query = db.query(Payment).filter(Payment.status == "Completed")
    
    if start_date:
        query = query.filter(Payment.payment_date >= start_date)
    if end_date:
        query = query.filter(Payment.payment_date <= end_date)
    
    payments = query.all()
    
    # Calculate total revenue
    total_revenue = sum(payment.amount_paid for payment in payments)
    
    # Calculate revenue by plan
    revenue_by_plan = {}
    for payment in payments:
        plan_name = payment.plan.plan_name
        if plan_name not in revenue_by_plan:
            revenue_by_plan[plan_name] = 0
        revenue_by_plan[plan_name] += payment.amount_paid
    
    # Count payments by status
    status_counts = {}
    all_payments = db.query(Payment).all()
    for payment in all_payments:
        if payment.status not in status_counts:
            status_counts[payment.status] = 0
        status_counts[payment.status] += 1
    
    return {
        "total_revenue": total_revenue,
        "revenue_by_plan": revenue_by_plan,
        "payment_status_counts": status_counts,
        "total_payments": len(payments)
    }
