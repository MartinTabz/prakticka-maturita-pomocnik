"use client";

import ErrorComponent from "@components/pageload/error";

export default function Error({ error, reset }) {
   return <ErrorComponent error={error} reset={reset} />
}
