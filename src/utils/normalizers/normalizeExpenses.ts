import { Expense } from "@/validations/expense.validations";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export function transformExpense(
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>,
): Expense {
  const data = doc.data();

  return {
    id: doc.id,

    amount: data.amount,
    branch: data.branch,
    checkout_number: data.checkout_number,
    currency: data.currency,
    description: data.description,
    shift_id: data.shift_id,
    user_id: data.user_id,

    created_at: data.created_at.toDate(),
    is_deleted: data.is_deleted,
    deleted_at: data.deleted_at ? data.deleted_at.toDate() : null,
  };
}
