import React from "react";

export const NavItem: React.FC<{ active: boolean }> = (props) => {
  const styles = {} as React.CSSProperties;
  if (props.active) {
    styles.fontWeight = "bold";
    styles.color = "hsl(0, 0%, 21%)";
  }
  return (
    <>
      <div style={styles}>{props.children}</div>
    </>
  );
};
