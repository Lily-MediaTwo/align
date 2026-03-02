declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};


declare const __dirname: string;

declare module 'path' {
  export function resolve(...paths: string[]): string;
}
