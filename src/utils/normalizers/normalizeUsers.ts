import { BUSINESS_BRANCH_MAP } from "@/types/businessBranch.types";
import { USER_ROLE_MAP } from "@/types/user.types";
import { User } from "@/validations/user.validations";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export function transformUser(
  doc: QueryDocumentSnapshot<DocumentData, DocumentData>,
): User {
  const data = doc.data();

  return {
    id: doc.id,
    uid: doc.id,
    name: data.name,
    last_name: data.last_name,
    email: data.email,
    employee_id: data.employee_id,
    is_active: data.is_active,
    branch: data.branch,
    branch_data:
      BUSINESS_BRANCH_MAP[data.branch as keyof typeof BUSINESS_BRANCH_MAP],
    role: data.role,
    role_data: USER_ROLE_MAP[data.role as keyof typeof USER_ROLE_MAP],
    created_at: data.created_at.toDate(),
    is_deleted: data.is_deleted,
    deleted_at: data.deleted_at ? data.deleted_at.toDate() : null,
  };
}

export function normalizeUsers(
  docs: QueryDocumentSnapshot<DocumentData, DocumentData>[],
): User[] {
  return docs.map((doc) => {
    const data = doc.data() as any;

    return {
      ...data,
      id: doc.id,
    };
  });
}
