import { Center, Loader } from "@mantine/core";
import React from "react";

const GlobalLoader = () => {
  return (
    <Center mah={500} h={300} className="w-full">
      <Loader c={"primary"} type="bars" z={1000} />
    </Center>
  );
};

export default GlobalLoader;
