"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useState } from "react";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";
import { GlobalStyles } from "./GlobalStyles";

export function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  const [sheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement();
    sheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined") {
    return (
      <>
        <GlobalStyles />
        {children}
      </>
    );
  }

  return (
    <StyleSheetManager sheet={sheet.instance}>
      <GlobalStyles />
      {children}
    </StyleSheetManager>
  );
}
