import { Button, type ButtonProps } from "@heroui/react";

interface Props extends ButtonProps {
  label?: string;
}

const FloatingActionButton = ({ label, ...props }: Props) => {
  return (
    <div className="fixed bottom-10 right-10 z-50">
      <Button
        {...props}
        color="primary"
        variant="shadow"
        isIconOnly={label === undefined}
      >
        {label}
      </Button>
    </div>
  );
};

export default FloatingActionButton;
