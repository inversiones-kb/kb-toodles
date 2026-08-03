import { useAuthStore } from "@/app/context/AuthProvider";
import { useBranchRouter } from "@/hooks/useBranchRouter";
import { loginWithEmailAndPassword } from "@/services/auth.service";
import { LoginInput, loginSchema } from "@/validations/auth.validations";
import { User } from "@/validations/user.validations";
import { Avatar, Button, Form, Input, Spinner } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowNarrowLeft } from "@tabler/icons-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  users: User[];
}

const LoginForm = ({ users }: Props) => {
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
  const nextRouter = useRouter();
  const user = useAuthStore((store) => store.user);

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    const res = await loginWithEmailAndPassword(data);

    if (!res.success) {
      setIsLoading(false);
      return toast.error(res.message);
    }

    toast.success(res.message);

    if (res.data.role === "CASHIER") {
      const branch = res.data.branch;

      nextRouter.push(`/${branch}/cajero`);
    } else if (res.data.role === "ADMIN") {
      router.push(`/dashboard`);
    }

    /* return router.push("/proveedores"); */
  };

  const email = watch("email");
  const selectedUser = email
    ? users.find((user) => user.email === email)
    : undefined;

  return (
    <section
      className={clsx([
        "w-full transition-[max-width] duration-500 p-8 rounded-3xl overflow-y-auto h-fit bg-layer-2 flex justify-center max-h-[90%]",
        email ? "max-w-md" : "max-w-3xl",
      ])}
    >
      <Form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <h2 className="text-2xl text-center w-full font-semibold mb-4">
          {email ? (
            <>
              Hola,{" "}
              <span className="text-primary">
                {selectedUser?.name.split(" ")[0]}{" "}
                {selectedUser?.last_name.split(" ")[0]}
              </span>
            </>
          ) : (
            "Elige tu usuario"
          )}
        </h2>

        {email ? (
          <div className="flex gap-2 w-full items-center pb-2 fadeIn">
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
          <div className="w-full gap-3 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] justify-center">
            {users
              ? users.map((user, i) => {
                  const names = user.name.split(" ");
                  const lastNames = user.last_name.split(" ");

                  return (
                    <Button
                      className={clsx([
                        "flex flex-col h-fit p-4 transition-all outline-2 outline-transparent fadeIn opacity-0 border border-soft-light/5 shadow-[0px_8px_12px_#12121255]",
                        {
                          "outline-primary": email === user.email,
                        },
                      ])}
                      style={{
                        animationDelay: `${i * 30}ms`,
                      }}
                      variant="light"
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
                        size={"lg"}
                      />
                      <p>
                        {names[0]} {lastNames[0]}
                      </p>
                    </Button>
                  );
                })
              : null}
          </div>
        )}

        {email ? (
          <Input
            label="Contraseña"
            variant="bordered"
            size="sm"
            radius="lg"
            isInvalid={Boolean(errors.password?.message)}
            errorMessage={errors.password?.message}
            {...register("password")}
            className="fadeIn"
          />
        ) : null}

        {email ? (
          <Button
            type="submit"
            color="primary"
            className="w-full mt-4 fadeIn"
            isLoading={isLoading}
          >
            Iniciar sesión
          </Button>
        ) : null}
      </Form>
    </section>
  );
};

export default LoginForm;
