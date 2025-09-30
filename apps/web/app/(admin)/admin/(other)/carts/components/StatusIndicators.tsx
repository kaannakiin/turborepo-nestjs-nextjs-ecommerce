import { useEffect, useState } from "react";
import { FloatingIndicator, UnstyledButton } from "@mantine/core";
import classes from "./StatusIndicators.module.css";

interface StatusIndicatorsProps {
  data: Array<{ name: string; slug: string }>;
  queryKey?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

const StatusIndicators = ({
  data,
  queryKey = "status",
  value,
  defaultValue,
  onChange,
}: StatusIndicatorsProps) => {
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const [controlsRefs, setControlsRefs] = useState<
    Record<string, HTMLButtonElement | null>
  >({});

  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState<string>(
    defaultValue || data[0]?.slug || ""
  );

  const active = isControlled ? value : internalValue;

  useEffect(() => {
    if (!isControlled && value) {
      setInternalValue(value);
    }
  }, [value, isControlled]);

  const setControlRef = (slug: string) => (node: HTMLButtonElement) => {
    controlsRefs[slug] = node;
    setControlsRefs(controlsRefs);
  };

  const handleClick = (slug: string) => {
    if (!isControlled) {
      setInternalValue(slug);
    }

    onChange?.(slug);
  };

  const controls = data.map((item) => (
    <UnstyledButton
      key={item.slug}
      className={classes.control}
      ref={setControlRef(item.slug)}
      onClick={() => handleClick(item.slug)}
      mod={{ active: active === item.slug }}
    >
      <span className={classes.controlLabel}>{item.name}</span>
    </UnstyledButton>
  ));

  return (
    <div className={classes.root} ref={setRootRef}>
      {controls}
      <FloatingIndicator
        target={controlsRefs[active]}
        parent={rootRef}
        className={classes.indicator}
      />
    </div>
  );
};

export default StatusIndicators;
