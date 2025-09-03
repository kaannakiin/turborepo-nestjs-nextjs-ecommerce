import { useRouter } from "expo-router";
import { View } from "react-native";
import { Button } from "tamagui";

export default function Index() {
  const { push } = useRouter();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button
        onPress={() => {
          push("/");
        }}
        textAlign={"center"}
        variant="outlined"
        size={"$6"}
      >
        Lorem ipsum
      </Button>
    </View>
  );
}
