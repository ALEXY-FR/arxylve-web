import {isTrustedContactBrowser,sameOrigin} from "../../../lib/admin-auth";
import {formatContactEmail} from "../../../lib/contact-email";
import {readContent} from "../../../lib/cms-store";
import { normalizeEmail, normalizePhone } from "../../../lib/contact-input";
import { emailDomainAcceptsMail } from "../../../lib/email-domain";
import { reserveContact, releaseContact, confirmContact } from "../../../lib/contact-store.mjs";
import { isSelectable, selectionKey, formatPrice, editionName, type Selection } from "../../../data/sculptures";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ContactPayload = {
  selection?: Selection[];
  firstName?: string;
  lastName?: string;
  phone?: string;
  phoneCountry?: string;
  email?: string;
  confirmEmail?: string;
  category?: string;
  dimensions?: string;
  message?: string;
  consent?: string;
  website?: string;
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

function decodePassword(encodedPassword: string) {
  try {
    return Buffer.from(encodedPassword, "base64").toString("utf8");
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
 const {sculptures}=await readContent();
  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      {
        message: "Demande invalide.",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Champ invisible destiné à bloquer les robots.
   */
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return NextResponse.json({message:"Demande invalide."},{status:400});

  if (clean(payload.website, 200)) {
    return NextResponse.json({
      message: "Votre demande a bien été transmise.",
    });
  }

  const firstName = clean(payload.firstName, 80);
  const lastName = clean(payload.lastName, 80);
  const phone = normalizePhone(payload.phone,payload.phoneCountry??"FR") ?? "";
  const email = normalizeEmail(payload.email) ?? "";
  const category = clean(payload.category, 120);
  const dimensions = clean(payload.dimensions, 240);
  const message = clean(payload.message, 5000);
  const acquisition=payload.selection !== undefined;
  const artworkLines:string[]=[];
  if (payload.selection !== undefined) {
    if (!Array.isArray(payload.selection) || !payload.selection.length || payload.selection.length > 50) return NextResponse.json({message:"Sélection invalide."},{status:400});
    const seen = new Set<string>();

    for (const item of payload.selection) {
      if (!item || typeof item !== "object" || typeof item.slug !== "string") return NextResponse.json({message:"Sélection invalide."},{status:400});
      const sculpture = sculptures.find(s => s.slug === item.slug);
      if (!sculpture || !isSelectable(sculpture,item.number) || seen.has(selectionKey(item))) return NextResponse.json({message:"Un exemplaire n’est plus disponible. Actualisez votre panier."},{status:409});
      seen.add(selectionKey(item));
      artworkLines.push(sculpture.title + (item.number !== undefined ? " — " + editionName(sculpture,item.number) : "") + " — " + formatPrice(sculpture.price!));
    }
  }

  const formIsInvalid =
    !firstName ||
    !lastName ||
    !phone ||
    !email ||
    normalizeEmail(payload.confirmEmail) !== email ||
    !category ||
    (!acquisition && !dimensions) ||
    message.length < 20 ||
    payload.consent !== "accepted";

  if (formIsInvalid) {
    return NextResponse.json(
      {
        message:
          "Vérifiez vos coordonnées : adresses e-mail identiques, téléphone valide (indicatif international hors France) et message complet.",
      },
      {
        status: 400,
      },
    );
  }



  const host = process.env.OVH_SMTP_HOST;
  const port = Number(process.env.OVH_SMTP_PORT ?? "587");
  const user = process.env.OVH_SMTP_USER;
  const encodedPassword =
    process.env.OVH_SMTP_PASSWORD_BASE64;
  const recipient = process.env.CONTACT_EMAIL;

  if (
    !host ||
    !user ||
    !encodedPassword ||
    !recipient
  ) {
    return NextResponse.json(
      {
        message:
          "La messagerie professionnelle n’est pas encore configurée.",
      },
      {
        status: 503,
      },
    );
  }

  try {
    if (!(await emailDomainAcceptsMail(email))) return NextResponse.json({ message: "Le domaine de cette adresse e-mail ne peut pas recevoir de messages. Vérifiez votre adresse." }, { status: 400 });
  } catch {
    return NextResponse.json({ message: "La vérification du domaine e-mail est temporairement indisponible. Réessayez dans un instant." }, { status: 503 });
  }

  const password = decodePassword(encodedPassword);

  if (!password) {
    return NextResponse.json(
      {
        message:
          "Le mot de passe de la messagerie est invalide.",
      },
      {
        status: 503,
      },
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    authMethod: "LOGIN",
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 25000,

    auth: {
      user,
      pass: password,
    },
  });

  const ownerTest=sameOrigin(request)&&await isTrustedContactBrowser();
  let reservation: string | null = null;
  
  try { reservation = await reserveContact(email, phone, {firstName,lastName,email,phone,category,dimensions:acquisition?"":dimensions,message,acquisition,artworks:artworkLines}, ownerTest); }
  catch { return NextResponse.json({ message: "Le suivi des demandes est temporairement indisponible. Réessayez dans un instant." }, { status: 503 }); }
  if (!reservation) return NextResponse.json({ message: "Vous avez déjà envoyé deux demandes en attente. Merci d’attendre notre réponse avant de nous écrire à nouveau." }, { status: 429 });


  try {
    await transporter.sendMail({
      from: `ARXYLVE — Formulaire <${user}>`,
      to: recipient,
      replyTo: email,

      ...formatContactEmail({firstName,lastName,phone,email,category,dimensions,message,acquisition,artworks:artworkLines}),
    });
  } catch {
    try { if(reservation)await releaseContact(reservation); } catch { console.error("Quota de contact à réconcilier après échec SMTP."); }
    console.error("Envoi du formulaire indisponible.");

    return NextResponse.json(
      {
        message:
          "L’envoi est momentanément indisponible. " +
          "Réessayez dans un instant.",
      },
      {
        status: 502,
      },
    );
  }

  try { await confirmContact(reservation); } catch { console.error("Confirmation du suivi indisponible après envoi SMTP."); }

  return NextResponse.json({
    message: "Votre demande a bien été transmise.",
  });
}