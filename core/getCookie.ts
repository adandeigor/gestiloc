export default function getCookie(name: string) {
  if (typeof document === "undefined") {
    return null; // Return null or a default value during SSR
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}