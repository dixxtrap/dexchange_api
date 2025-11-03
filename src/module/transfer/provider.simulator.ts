export class ProviderSimulator {
     constructor(private readonly delayMs = 2000) { }

     async process(): Promise<{ ok: true; providerRef: string } | { ok: false; errorCode: string }> {
          // Simule un délai de 2 secondes
          await new Promise((resolve) => setTimeout(resolve, this.delayMs));

          // 70% de chances de succès
          const chance = Math.random();
          if (chance < 0.7) {
               return { ok: true, providerRef: `PRV-${Math.floor(Math.random() * 1e6)}` };
          }

          // 30% d'échec
          return { ok: false, errorCode: `ERR-${Math.floor(Math.random() * 999)}` };
     }
}