"use client";
import { Stepper } from "@mantine/core";
import { $Enums } from "@repo/database";
import { useState } from "react";

interface OrderStatusStepperProps {
  status: $Enums.OrderStatus;
}

const OrderStatusStepper = ({ status }: OrderStatusStepperProps) => {
  const steps: Array<{
    label: string;
    description?: string;
    order: number;
    value: $Enums.OrderStatus;
  }> = [
    {
      value: "PENDING",
      label: "Beklemede",
      description: "Sipariş alındı",
      order: 0,
    },
    {
      value: "CONFIRMED",
      label: "Onaylandı",
      description: "Sipariş onaylandı",
      order: 1,
    },
    {
      value: "PROCESSING",
      label: "Hazırlanıyor",
      description: "Sipariş hazırlanıyor",
      order: 2,
    },
    {
      value: "SHIPPED",
      label: "Kargoya Verildi",
      description: "Sipariş kargoya teslim edildi",
      order: 3,
    },
    {
      value: "DELIVERED",
      label: "Teslim Edildi",
      description: "Sipariş teslim edildi",
      order: 4,
    },
  ];

  const isCancelled = status === "CANCELLED";
  const isRefunded = status === "REFUNDED";

  const getActiveStep = () => {
    if (isCancelled || isRefunded) {
      return -1;
    }
    const currentStep = steps.find((step) => step.value === status);
    if (!currentStep) return 0;

    return currentStep.order + 1;
  };
  return (
    <div>
      {isCancelled && (
        <>
          <p className="font-semibold">❌ Sipariş İptal Edildi</p>
          <p className="text-sm">Bu sipariş iptal edilmiştir.</p>
        </>
      )}

      {isRefunded && (
        <>
          <p className="font-semibold">💰 İade Edildi</p>
          <p className="text-sm">
            Sipariş iade edildi ve ödeme iade işlemi yapıldı.
          </p>
        </>
      )}

      {!isCancelled && !isRefunded && (
        <Stepper
          active={getActiveStep()}
          orientation="vertical"
          color="primary"
        >
          {steps.map((step) => (
            <Stepper.Step
              key={step.value}
              c={"primary"}
              color="primary"
              classNames={{}}
              label={step.label}
              description={step.description}
            />
          ))}
        </Stepper>
      )}
    </div>
  );
};

export default OrderStatusStepper;
