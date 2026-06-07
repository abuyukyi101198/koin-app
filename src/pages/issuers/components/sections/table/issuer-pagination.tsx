import { Fragment } from "react";

import { Button } from "@/components/ui/button.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { cn } from "@/lib/utils.ts";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface IssuerPaginationProps {
  activeLetter: string | null;
  onLetterChange: (letter: string | null) => void;
}

export function IssuerPagination({
  activeLetter,
  onLetterChange,
}: IssuerPaginationProps) {
  return (
    <nav
      aria-label="Filter issuers by letter"
      className="relative flex justify-center items-center h-14 px-4 py-3 border-t"
    >
      <div className="flex flex-wrap justify-center items-center">
        <Button
          aria-pressed={activeLetter === null}
          className={cn(
            "h-6 min-w-6 px-1.5 text-xs cursor-pointer text-muted-foreground",
            activeLetter === null && "font-bold underline text-primary"
          )}
          onClick={() => {
            onLetterChange(null);
          }}
          size="icon"
          variant="link"
        >
          All
        </Button>
        <div className="flex justify-center items-center">
          {ALPHABET.slice(0, ALPHABET.length / 2).map((letter) => (
            <Fragment key={letter}>
              <Separator className="h-6!" orientation={"vertical"} />
              <Button
                aria-pressed={activeLetter === letter}
                className={cn(
                  "size-6 text-xs cursor-pointer text-muted-foreground",
                  activeLetter === letter && "font-bold underline text-primary"
                )}
                onClick={() => {
                  onLetterChange(activeLetter === letter ? null : letter);
                }}
                size="icon"
                variant="link"
              >
                {letter}
              </Button>
            </Fragment>
          ))}
        </div>
        <div className="flex justify-center items-center">
          {ALPHABET.slice(ALPHABET.length / 2).map((letter) => (
            <Fragment key={letter}>
              <Separator className="h-6!" orientation={"vertical"} />
              <Button
                aria-pressed={activeLetter === letter}
                className={cn(
                  "size-6 text-xs cursor-pointer text-muted-foreground",
                  activeLetter === letter && "font-bold underline text-primary"
                )}
                onClick={() => {
                  onLetterChange(activeLetter === letter ? null : letter);
                }}
                size="icon"
                variant="link"
              >
                {letter}
              </Button>
            </Fragment>
          ))}
        </div>
      </div>
    </nav>
  );
}
