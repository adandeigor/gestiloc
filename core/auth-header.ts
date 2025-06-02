// authHeader.ts
export const authHeader = (jwt: string) => ({
  Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
  "Authorization-JWT": jwt ? `Bearer ${jwt}` :'',
});