declare module "@barba/core" {
  const barba: {
    init: (config: any) => void;
    destroy: () => void;
    go: (url: string) => Promise<void>;
    [key: string]: any;
  };
  export default barba;
}
