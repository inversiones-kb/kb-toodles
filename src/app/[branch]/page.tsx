"use client";

import { useCollectionQuery } from "@/hooks/useCollectionQuery";
import { User } from "@/validations/user.validations";
import { and, or, where } from "firebase/firestore";
import LoginForm from "@/components/auth/LoginForm";
import { Spinner } from "@heroui/react";
import { BusinessBranch } from "@/types/businessBranch.types";
import { useParams } from "next/navigation";

export default function BranchLoginPage() {
  const branch = useParams().branch as BusinessBranch;

  const { data: users, isLoading: usersIsLoading } = useCollectionQuery<User>(
    "users",
    [
      and(
        where("is_active", "==", true),
        where("is_deleted", "==", false),
        or(where("branch", "==", branch), where("role", "==", "ADMIN")),
      ),
      /* where("employee_id", "!=", null), */
    ],
    [],
  );

  return (
    <main className="h-dvh max-h-full bg-background flex justify-center items-center px-8">
      {usersIsLoading ? (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      ) : (
        <LoginForm users={users} />
      )}
    </main>
  );
}
