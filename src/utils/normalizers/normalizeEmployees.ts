import { BUSINESS_BRANCH_MAP } from "@/types/businessBranch.types";
import { SHIFT_MAP } from "@/types/employee.types";
import { USER_ROLE_MAP } from "@/types/user.types";
import { Employee } from "@/validations/employee.validations";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export function transformEmployee(
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>,
): Employee {
  const data = doc.data();

  return {
    id: doc.id,
    doc_number: data.doc_number,
    doc_type: data.doc_type,
    files: data.files,
    is_deleted: data.is_deleted,
    last_name: data.last_name,
    name: data.name,
    payments: data.payments,
    shift_data: SHIFT_MAP[data.shift as keyof typeof SHIFT_MAP],
    shift: data.shift,
    photo: data.photo,
    role: data.role,
    salary: data.salary,
    branch: data.branch,
    is_fired: data.is_fired,
    fired_at: data.fired_at ? data.fired_at.toDate() : null,
    branch_data:
      BUSINESS_BRANCH_MAP[data.branch as keyof typeof BUSINESS_BRANCH_MAP],
    cv_attachment: data.cv_attachment,
    rif_attachment: data.rif_attachment,
    address: data.address,
    email: data.email,
    role_data: USER_ROLE_MAP[data.role as keyof typeof USER_ROLE_MAP],
    hired_at: data.hired_at.toDate(),
    birthdate: data.birthdate.toDate(),
    created_at: data.created_at.toDate(),
    deleted_at: data.deleted_at ? data.deleted_at.toDate() : null,
  };
}

export function normalizeEmployees(
  docs: QueryDocumentSnapshot<DocumentData, DocumentData>[],
): Employee[] {
  return docs.map((doc) => {
    const data = doc.data() as any;

    return {
      ...data,
      id: doc.id,
      hired_at: data.hired_at.toDate(),
    };
  });
}
