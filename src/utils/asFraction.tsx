import { ReactNode } from "react";

export function asFraction(
  title: string | undefined,
  value: number | undefined
): ReactNode {
  if (!title || !value) return "";
  const wholeNumber = Math.floor(value);
  const titleParts = title.split(" ");
  const restOfTitle = titleParts.slice(1).join(" ");

  const tolerance = 1e-6;
  const decimalPart = value - Math.floor(value);

  // Handle whole numbers
  if (Math.abs(decimalPart) < tolerance) {
    const [first, ...rest] = title.split(" ");
    const formatted = Number(first).toLocaleString("de-DE");
    return rest.length ? `${formatted} ${rest.join(" ")}` : formatted;
  }

  let numerator, denominator;
  // Find the best fraction approximation
  for (let d = 1; d <= 100; d++) {
    for (let n = 1; n <= 100; n++) {
      if (Math.abs(n / d - decimalPart) < tolerance) {
        numerator = n;
        denominator = d;
        break;
      }
    }
    if (numerator && denominator) {
      break;
    }
  }

  return (
    <>
      {wholeNumber ? `${wholeNumber.toLocaleString("de-DE")} ` : ""}
      <sup>{numerator}</sup>&#x2044;<sub>{denominator}</sub>
      {restOfTitle && ` ${restOfTitle}`}
    </>
  );
}
