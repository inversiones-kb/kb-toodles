"use client";

import { loginWithEmailAndPassword } from "@/services/auth.service";
import { LoginInput, loginSchema } from "@/validations/auth.validations";
import { Avatar, Button, Form, Input, Spinner } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuthStore } from "./context/AuthProvider";
import { useBranchRouter } from "@/hooks/useBranchRouter";
import { useBasicUsers } from "@/hooks/users/useBasicUsers";
import { IconArrowNarrowLeft, IconUsers } from "@tabler/icons-react";
import clsx from "clsx";

export default function HomePage() {
  const { data: users, isLoading: usersIsLoading } = useBasicUsers();

  const {
    watch,
    setValue,
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useBranchRouter();
  const user = useAuthStore((store) => store.user);

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    const res = await loginWithEmailAndPassword(data);

    setIsLoading(false);

    if (!res.success) {
      return toast.error(res.message);
    }

    toast.success(res.message);
    /* return router.push("/proveedores"); */
  };

  const email = watch("email");
  const selectedUser = email
    ? users.find((user) => user.email === email)
    : undefined;

  return (
    <main className="h-dvh max-h-full bg-background flex justify-center items-center">
      <section
        className={clsx([
          "w-full transition-[max-width_5s] p-4 rounded-3xl overflow-y-auto h-fit bg-layer-2 flex justify-center",
          email ? "max-w-md" : "max-w-xl",
        ])}
      >
        <Form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <h2 className="text-2xl text-center w-full font-semibold mb-4">
            {email ? (
              <>
                Bienvenido,{" "}
                <span className="text-primary">{selectedUser?.name}</span>
              </>
            ) : (
              "Iniciar sesión"
            )}
          </h2>

          {email ? (
            <div className="flex gap-2 w-full items-center pb-2">
              <Button
                isIconOnly
                className="rounded-full"
                onPress={() => setValue("email", "")}
                variant="flat"
              >
                <IconArrowNarrowLeft />
              </Button>

              <div className="flex flex-col gap-0">
                <h6 className="text-sm leading-tight">
                  {selectedUser?.name} {selectedUser?.last_name}
                </h6>
                <p className="text-sm text-soft-light leading-tight">{email}</p>
              </div>
            </div>
          ) : (
            <div className="w-full flex gap-3 flex-wrap">
              {usersIsLoading ? (
                <div className="w-full flex justify-center">
                  <Spinner />
                </div>
              ) : null}

              {!usersIsLoading && users
                ? users.map((user) => (
                    <Button
                      className={clsx([
                        "flex flex-col h-fit p-4 transition-all outline-2 outline-transparent",
                        {
                          "outline-primary": email === user.email,
                        },
                      ])}
                      variant="flat"
                      key={user.email}
                      type="button"
                      onPress={() => setValue("email", user.email)}
                    >
                      <Avatar
                        fallback={
                          <>
                            {user.name[0]}
                            {user.last_name[0]}
                          </>
                        }
                        showFallback
                      />
                      <p>
                        {user.name} {user.last_name}
                      </p>
                    </Button>
                  ))
                : null}
            </div>
          )}

          {/* <div className="flex gap-2 w-full">
            <Input
              label="Correo"
              variant="bordered"
              size="sm"
              radius="lg"
              className="flex-1"
              isInvalid={Boolean(errors.email?.message)}
              errorMessage={errors.email?.message}
              {...register("email")}
            />

            <Button size="lg" isIconOnly variant="faded" color="default">
              <IconUsers />
            </Button>
          </div>

          <Input
            label="Contraseña"
            variant="bordered"
            size="sm"
            radius="lg"
            isInvalid={Boolean(errors.password?.message)}
            errorMessage={errors.password?.message}
            {...register("password")}
          /> */}

          {email ? (
            <Input
              label="Contraseña"
              variant="bordered"
              size="sm"
              radius="lg"
              isInvalid={Boolean(errors.password?.message)}
              errorMessage={errors.password?.message}
              {...register("password")}
            />
          ) : null}

          {email ? (
            <Button
              type="submit"
              color="primary"
              className="w-full mt-4"
              isLoading={isLoading}
            >
              Iniciar sesión
            </Button>
          ) : null}
        </Form>
      </section>
    </main>
  );
}
