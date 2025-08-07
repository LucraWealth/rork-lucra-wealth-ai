import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to the onboarding screen
  return <Redirect href="/onboarding" />
}