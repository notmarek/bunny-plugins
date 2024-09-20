import { logger } from "@vendetta";
import Settings from "./Settings";
import { before } from "@vendetta/patcher";

import { General, Forms } from "@vendetta/ui/components";
import { findByProps, findByPropsLazy } from "@vendetta/metro";
const { View, ScrollView } = General;

function isValidHttpUrl(input) {
  let url;

  try {
    url = new URL(input);
  } catch {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}
const {
  Button,
  FlashList,
  FloatingActionButton,
  HelpMessage,
  IconButton,
  Stack,
  Text,
  TextInput,
} = findByProps("FloatingActionButton", "Button");
const { ErrorBoundary } = bunny.ui.components;
let patches = [];
const actionSheet = findByProps("hideActionSheet");
const { ActionSheet, BottomSheetTitleHeader } = findByProps(
  "ActionSheet",
  "BottomSheetTitleHeader",
);
function promptActionSheet(Component, title, props) {
  logger.log(typeof ActionSheet);

  logger.log(typeof BottomSheetTitleHeader);

  logger.log(typeof ErrorBoundary);
  actionSheet.openLazy(
    Promise.resolve({
      default: () => (
        <ErrorBoundary>
          <ActionSheet>
            <BottomSheetTitleHeader title={title} />
            <Component {...props} />
          </ActionSheet>
        </ErrorBoundary>
      ),
    }),
    "AddonPageActionSheet",
  );
}

function NewAddonPage({ label, fetchFn }) {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState("");
  const [isFetching, setIsFetching] = React.useState(false);

  function onConfirmWrapper() {
    setIsFetching(true);

    fetchFn(value)
      .then(() => actionSheet.hideActionSheet())
      .catch((e) => (e instanceof Error ? setError(e.message) : String(e)))
      .finally(() => setIsFetching(false));
  }

  return (
    <View
      style={{
        padding: 8,
        gap: 12,
      }}
    >
      <TextInput
        autoFocus={true}
        isClearable={true}
        value={value}
        label={"URL"}
        placeholder={"https://notmarek.github.io/bunny-plugins/224compat"}
        onChange={(v) => {
          setValue(v);
          if (error) setError("");
        }}
        returnKeyType="done"
        onSubmitEditing={onConfirmWrapper}
        state={error ? "error" : undefined}
        errorMessage={error || undefined}
      />
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={{ gap: 8 }}
      >
        <Button
          size="sm"
          variant="tertiary"
          text="Import from clipboard"
          icon={bunny.api.assets.findAssetId("ClipboardListIcon")}
          onPress={() =>
            bunny.metro.common.clipboard
              .getString()
              .then((str) => setValue(str))
          }
        />
      </ScrollView>
      <Button
        loading={isFetching}
        text="Install"
        variant="primary"
        disabled={!value || !isValidHttpUrl(value)}
        onPress={onConfirmWrapper}
      />
      <Button
        disabled={isFetching}
        text="Cancel"
        variant="secondary"
        onPress={() => actionSheet.hideActionSheet()}
      />
    </View>
  );
}

function AddonSheet(label, fetchFn) {
  promptActionSheet(NewAddonPage, label, {
    label: label,
    fetchFn: fetchFn,
  });
}

function openAlertDetour([ident, component], orig) {
  if (ident === "AddonInputAlert") {
    return AddonSheet(component.props.label, component.props.fetchFn);
  } else {
    return orig.apply(this, [ident, component]);
  }
}
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
    const alerts = findByProps("openAlert", "dismissAlert");
    //patches.push(before("AlertModal", modals, AlertPatch));
    logger.log("hiiiibefore insted");
    patches.push(
      window.bunny.api.patcher.instead("openAlert", alerts, openAlertDetour),
    );
    logger.log("hello from my ass");
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
