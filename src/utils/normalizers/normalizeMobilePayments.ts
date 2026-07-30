import { MobilePayment } from "@/validations/mobile_payment.validations";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export function transformMobilePayment(
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>,
): MobilePayment {
  const data = doc.data();

  return {
    id: doc.id,
    ref: data.ref,

    amount: data.amount,
    branch: data.branch,

    checkout_number: data.checkout_number,
    shift_id: data.shift_id,
    user_id: data.user_id,

    created_at: data.created_at.toDate(),
    is_deleted: data.is_deleted,
    deleted_at: data.deleted_at ? data.deleted_at.toDate() : null,
  };
}
