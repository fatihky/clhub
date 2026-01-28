export interface Logger {
  debug: (message: string) => void;
  info: (message: string) => void;
}

export function createLogger(verbose: boolean): Logger {
  return {
    debug: (message: string) => {
      if (verbose) {
        console.log(`[DEBUG] ${message}`);
      }
    },
    info: (message: string) => {
      console.log(`[INFO] ${message}`);
    },
  };
}

/** A no-op logger that doesn't output anything */
export const silentLogger: Logger = {
  debug: () => {},
  info: (message: string) => {
    console.log(`[INFO] ${message}`);
  },
};
