// ── payment.service.ts ────────────────────────────────────────────────────────
import crypto from 'crypto'; // FIX : import ES module au lieu de require()

export interface InitiationPaiement {
  montant: number;
  telephone: string;
  reference: string;
  description: string;
}

export interface ResultatPaiement {
  success: boolean;
  referenceOperateur?: string;
  message: string;
  statut: 'SUCCES' | 'ECHEC' | 'EN_ATTENTE';
}

export interface PaymentProvider {
  initierPaiement(data: InitiationPaiement): Promise<ResultatPaiement>;
  verifierStatut(referenceOperateur: string): Promise<ResultatPaiement>;
  validerWebhook(payload: any, signature: string): boolean;
}

// ── MoMo ──────────────────────────────────────────────────────────────────────
export class MoMoProvider implements PaymentProvider {
  private baseUrl = process.env.MOMO_BASE_URL!;
  private subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY!;
  private apiUser = process.env.MOMO_API_USER!;
  private apiKey = process.env.MOMO_API_KEY!;
  private targetEnv = process.env.MOMO_TARGET_ENV || 'sandbox';

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');
  }

  async initierPaiement(data: InitiationPaiement): Promise<ResultatPaiement> {
    try {
      const response = await fetch(`${this.baseUrl}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'X-Reference-Id': data.reference,
          'X-Target-Environment': this.targetEnv,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: data.montant.toString(),
          currency: 'XOF',
          externalId: data.reference,
          payer: { partyIdType: 'MSISDN', partyId: data.telephone },
          payerMessage: data.description,
          payeeNote: 'Abonnement ColocBénin 300 FCFA',
        }),
      });

      if (response.status === 202) {
        return { success: true, referenceOperateur: data.reference, message: 'Paiement initié', statut: 'EN_ATTENTE' };
      }
      return { success: false, message: 'Echec initiation MoMo', statut: 'ECHEC' };
    } catch {
      return { success: false, message: 'Erreur réseau MoMo', statut: 'ECHEC' };
    }
  }

  async verifierStatut(referenceOperateur: string): Promise<ResultatPaiement> {
    try {
      const response = await fetch(`${this.baseUrl}/collection/v1_0/requesttopay/${referenceOperateur}`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'X-Target-Environment': this.targetEnv,
          'Ocp-Apim-Subscription-Key': this.subscriptionKey,
        },
      });
      const data = await response.json();
      if (data.status === 'SUCCESSFUL') return { success: true, message: 'Paiement confirmé', statut: 'SUCCES' };
      if (data.status === 'FAILED') return { success: false, message: data.reason || 'Paiement échoué', statut: 'ECHEC' };
      return { success: false, message: 'En attente', statut: 'EN_ATTENTE' };
    } catch {
      return { success: false, message: 'Erreur vérification MoMo', statut: 'ECHEC' };
    }
  }

  validerWebhook(_payload: any, _signature: string): boolean {
    // TODO: implémenter la vérification HMAC quand la doc MoMo sandbox sera disponible
    return true;
  }
}

// ── C'Cash ────────────────────────────────────────────────────────────────────
export class CCashProvider implements PaymentProvider {
  private baseUrl = process.env.CCASH_BASE_URL!;
  private apiKey = process.env.CCASH_API_KEY!;
  private merchantId = process.env.CCASH_MERCHANT_ID!;

  async initierPaiement(data: InitiationPaiement): Promise<ResultatPaiement> {
    try {
      const response = await fetch(`${this.baseUrl}/payment/initiate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: this.merchantId,
          amount: data.montant,
          currency: 'XOF',
          phone: data.telephone,
          reference: data.reference,
          description: data.description,
          callback_url: `${process.env.BACKEND_URL}/webhooks/ccash`,
        }),
      });
      const result = await response.json();
      if (result.success) {
        return { success: true, referenceOperateur: result.transaction_id, message: "Paiement C'cash initié", statut: 'EN_ATTENTE' };
      }
      return { success: false, message: result.message || "Echec C'cash", statut: 'ECHEC' };
    } catch {
      return { success: false, message: "Erreur réseau C'cash", statut: 'ECHEC' };
    }
  }

  async verifierStatut(_referenceOperateur: string): Promise<ResultatPaiement> {
    // TODO: endpoint de vérification C'cash à confirmer avec Celtiis
    return { success: false, message: "Vérification C'cash non implémentée", statut: 'EN_ATTENTE' };
  }

  // FIX : crypto importé en haut du fichier, plus de require() inline
  validerWebhook(payload: any, signature: string): boolean {
    const expected = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET!)
      .update(JSON.stringify(payload))
      .digest('hex');
    return signature === expected;
  }
}

// ── Moov Money ────────────────────────────────────────────────────────────────
export class MoovMoneyProvider implements PaymentProvider {
  private baseUrl = process.env.MOOV_BASE_URL!;
  private apiKey = process.env.MOOV_API_KEY!;
  private merchantCode = process.env.MOOV_MERCHANT_CODE!;

  async initierPaiement(data: InitiationPaiement): Promise<ResultatPaiement> {
    try {
      const response = await fetch(`${this.baseUrl}/payment/request`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_code: this.merchantCode,
          amount: data.montant,
          phone_number: data.telephone,
          reference: data.reference,
          description: data.description,
        }),
      });
      const result = await response.json();
      if (result.status === 'PENDING') {
        return { success: true, referenceOperateur: result.id, message: 'Paiement Moov initié', statut: 'EN_ATTENTE' };
      }
      return { success: false, message: 'Echec Moov Money', statut: 'ECHEC' };
    } catch {
      return { success: false, message: 'Erreur réseau Moov', statut: 'ECHEC' };
    }
  }

  async verifierStatut(_referenceOperateur: string): Promise<ResultatPaiement> {
    return { success: false, message: 'Non implémenté', statut: 'EN_ATTENTE' };
  }

  validerWebhook(_payload: any, _signature: string): boolean {
    // TODO: implémenter quand la doc Moov sera disponible
    return true;
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────
export function getPaymentProvider(operateur: string): PaymentProvider {
  switch (operateur) {
    case 'MOMO': return new MoMoProvider();
    case 'CCASH': return new CCashProvider();
    case 'MOOV_MONEY': return new MoovMoneyProvider();
    default: throw new Error(`Opérateur inconnu : ${operateur}`);
  }
}