import { LoginScreen } from "./components/LoginScreen";
import { SignedInScreen } from "./components/SignedInScreen";
import { useDeviceCode, useSignIn } from "./hooks/useSignIn";
import { useSignOut } from "./hooks/useSignOut";
import { useToken } from "./hooks/useToken";
import { useViewer } from "./hooks/useViewer";

function App() {
  const token = useToken();
  const viewer = useViewer();
  const deviceCode = useDeviceCode();
  const signIn = useSignIn();
  const signOut = useSignOut();

  if (token.isPending) {
    return null;
  }

  if (viewer.data) {
    return <SignedInScreen viewer={viewer.data} onSignOut={() => signOut.mutate()} />;
  }

  if (token.data) {
    return null;
  }

  if (deviceCode.data) {
    return (
      <LoginScreen
        status="awaiting-device"
        deviceCode={deviceCode.data}
        onSignIn={() => signIn.mutate()}
      />
    );
  }

  return (
    <LoginScreen status="signed-out" error={signIn.error?.message} onSignIn={() => signIn.mutate()} />
  );
}

export default App;
