import { Center, Loader as MantineLoader } from "@mantine/core";

const Loader = () => {
  return (
    <Center mah={500} h={300} className="w-full">
      <MantineLoader c={"primary"} type="bars" z={1000} />
    </Center>
  );
};

export default Loader;
