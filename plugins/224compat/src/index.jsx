import { logger } from "@vendetta";
import Settings from "./Settings";
import { before } from "@vendetta/patcher";

import { General, Forms } from "@vendetta/ui/components";
import { findByProps } from "@vendetta/metro";
const {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Pressable,
  Image,
} = General;
let patches = [];
function AlertPatch(args) {
  logger.log("we are inside the alert patch");
  //logger.log(args);

  if (args[0].extraContent) {
    let maybeTextInput = args[0].extraContent.props.children[0];

    if (maybeTextInput.props.returnKeyType !== undefined) {
      maybeTextInput.props.placeholder =
        "This is a read-only input, use the button below to paste the URL.";
      maybeTextInput.props.state = undefined;
      maybeTextInput.props.readOnly = true;
      maybeTextInput.props.size = "md";
      maybeTextInput.props.autoFocus = false;
    }
    args[0].content = (
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* <Text style={{ color: "white", paddingBottom: 15 }}>
          {args[0].content}
        </Text> */}

        {args[0].extraContent.props.children}
      </View>
    );
    args[0].extraContent = null;
  }
  // args[0].content = "NIger";
  return args;
}

export default {
  onLoad: async () => {
    const socket = bunny.api.debug.socket;
    if (socket === undefined || socket.readyState === WebSocket.CLOSED)
      await bunny.api.debug.connectToDebugger("10.10.10.177:9090");
    const modals = findByProps("AlertModal", "AlertActions");
    patches.push(before("AlertModal", modals, AlertPatch));
    patches.push(
      before("log", logger, (args) => {
        bunny.api.debug.socket.send(JSON.stringify({ message: args }));
        return args;
      }),
    );
    bunny.api.debug.socket.send(JSON.stringify({ message: "Loaded" }));
    // logger.log(lol);
    logger.log("Hello world!");
  },
  onUnload: () => {
    for (const patch of patches) {
      patch();
    }
    logger.log("Goodbye, world.");
  },
  settings: Settings,
};
