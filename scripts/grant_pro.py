"""
ARGOS AI - Administrative Subscription Grant Script
Grants ARGOS PRO tier to a specified user by email address, sets active status,
configures expiration, and logs the administrative action.

Usage:
    python scripts/grant_pro.py --email <user_email> [--days 365] [--role analyst]
"""

import sys
import argparse
from datetime import datetime, timezone, timedelta
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
sys.path.insert(0, str(backend_dir))

from app.db.session import SessionLocal
from app.db.models.user import User
from app.db.models.subscription import Subscription, Plan, AuditLog
from app.services.subscription_service import subscription_service


def grant_pro_subscription(email: str, duration_days: int = 365, role: str = None) -> bool:
    email_clean = email.strip().lower()
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email.ilike(email_clean)).first()
        if not user:
            print(f"[ERROR] User with email '{email_clean}' not found in database.")
            return False

        print(f"[FOUND] User: {user.name} ({user.email}) | ID: {user.id}")
        
        # Ensure 'pro' plan exists
        pro_plan = db.query(Plan).filter(Plan.id == "pro").first()
        if not pro_plan:
            print("[INFO] Initializing 'pro' plan definition...")
            pro_plan = Plan(
                id="pro",
                name="ARGOS PRO",
                price_inr=199,
                billing_period="monthly",
                is_active=True,
            )
            db.add(pro_plan)
            db.commit()

        # Retrieve or create subscription
        sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=duration_days) if duration_days > 0 else None

        if not sub:
            sub = Subscription(
                user_id=user.id,
                plan_id="pro",
                status="active",
                started_at=now,
                expires_at=expires_at,
                provider="manual_grant",
            )
            db.add(sub)
        else:
            sub.plan_id = "pro"
            sub.status = "active"
            sub.started_at = now
            sub.expires_at = expires_at
            sub.provider = "manual_grant"

        if role:
            user.role = role

        # Record audit log
        audit = AuditLog(
            user_id=user.id,
            action="ADMIN_PRO_GRANT",
            feature="subscription",
            details=f"Administrative grant: ARGOS PRO awarded for {duration_days} days.",
            created_at=now,
        )
        db.add(audit)

        db.commit()
        db.refresh(user)
        db.refresh(sub)

        effective_plan = subscription_service.get_effective_plan_id(user, db)
        print("\n========================================================")
        print("          ARGOS PRO SUBSCRIPTION ACTIVATED             ")
        print("========================================================")
        print(f" User Name       : {user.name}")
        print(f" User Email      : {user.email}")
        print(f" User ID         : {user.id}")
        print(f" Plan ID         : {sub.plan_id.upper()}")
        print(f" Effective Plan  : {effective_plan.upper()}")
        print(f" Status          : {sub.status.upper()}")
        print(f" Started At      : {sub.started_at.strftime('%Y-%m-%d %H:%M:%S UTC')}")
        exp_str = sub.expires_at.strftime('%Y-%m-%d %H:%M:%S UTC') if sub.expires_at else 'Perpetual'
        print(f" Valid Until     : {exp_str}")
        print(f" Provider        : {sub.provider}")
        print("========================================================\n")
        return True

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to grant Pro tier: {e}")
        return False
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Grant ARGOS PRO subscription to user by email.")
    parser.add_argument("--email", required=True, help="User email address")
    parser.add_argument("--days", type=int, default=365, help="Subscription duration in days (default: 365)")
    parser.add_argument("--role", type=str, default=None, help="Optionally update user role (e.g. analyst, admin)")
    args = parser.parse_args()

    success = grant_pro_subscription(email=args.email, duration_days=args.days, role=args.role)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

