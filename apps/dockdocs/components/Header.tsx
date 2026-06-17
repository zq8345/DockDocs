"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { defaultLocale, isAllLocale, routeLocales, localeLabels } from "@/lib/i18n";
import { getUser, onAuthChange, type AuthUser } from "@/lib/auth";

// ── Top-level nav categories. Each opens a dropdown; PDF tools has sub-columns. ──
type NavItem = { name: string; slug: string; soon?: boolean };
type NavCol = { heading?: string; items: NavItem[] };
type NavCat = { label: string; tier: string; cols: NavCol[] };

export const navCategories: Record<"en" | "zh" | "es" | "pt" | "fr" | "ja", NavCat[]> = {
  en: [
    {
      label: "PDF tools",
      tier: "Free",
      cols: [
        {
          heading: "Convert",
          items: [
            { name: "PDF to Word", slug: "/pdf-to-word" },
            { name: "PDF to Excel", slug: "/pdf-to-excel" },
            { name: "PDF to PPT", slug: "/pdf-to-ppt" },
            { name: "PDF to PDF/A", slug: "/pdf-to-pdfa" },
            { name: "PDF to Image", slug: "/pdf-to-image" },
            { name: "PDF to HTML", slug: "/pdf-to-html" },
            { name: "PDF to Markdown", slug: "/pdf-to-markdown" },
            { name: "Word to PDF", slug: "/word-to-pdf" },
            { name: "Excel to PDF", slug: "/excel-to-pdf" },
            { name: "PPT to PDF", slug: "/ppt-to-pdf" },
            { name: "Image to PDF", slug: "/images-to-pdf" },
            { name: "HTML to PDF", slug: "/html-to-pdf" },
          ],
        },
        {
          heading: "Organize",
          items: [
            { name: "Split PDF", slug: "/split-pdf" },
            { name: "Compress PDF", slug: "/compress-pdf" },
            { name: "Delete Pages", slug: "/delete-page" },
            { name: "Rotate Pages", slug: "/rotate-page" },
            { name: "Reorder Pages", slug: "/reorder-pages" },
            { name: "Add Page", slug: "/add-page" },
            { name: "Watermark PDF", slug: "/watermark-pdf" },
            { name: "Add Page Numbers", slug: "/page-numbers" },
            { name: "Crop PDF", slug: "/crop-pdf" },
            { name: "Redact PDF", slug: "/redact-pdf" },
            { name: "Sign PDF", slug: "/sign-pdf" },
          ],
        },
        {
          heading: "Security & OCR",
          items: [
            { name: "Protect PDF", slug: "/protect-pdf" },
            { name: "Unlock PDF", slug: "/unlock-pdf" },
            { name: "PDF OCR", slug: "/ocr-pdf" },
          ],
        },
      ],
    },
    {
      label: "Batch processing",
      tier: "Plus",
      cols: [
        {
          items: [
            { name: "Merge PDF", slug: "/merge-pdf" },
            { name: "Batch compress", slug: "/batch-compress" },
            { name: "Batch PDF to image", slug: "/batch-pdf-to-image" },
            { name: "Batch encrypt", slug: "/batch-protect-pdf" },
            { name: "Batch rename", slug: "/batch-rename-pdf" },
            { name: "Batch watermark", slug: "/batch-watermark-pdf" },
            { name: "Batch page numbers", slug: "/batch-page-numbers" },
            { name: "Batch split", slug: "/batch-split-merge" },
            { name: "Batch rotate", slug: "/batch-rotate-pdf" },
            { name: "Batch PDF to Word", slug: "/batch-pdf-to-word" },
            { name: "Batch PDF to Excel", slug: "/batch-pdf-to-excel" },
            { name: "Batch Word to PDF", slug: "/batch-word-to-pdf" },
            { name: "Batch Excel to PDF", slug: "/batch-excel-to-pdf" },
            { name: "Batch PPT to PDF", slug: "/batch-ppt-to-pdf" },
            { name: "Batch translate", slug: "/batch-translate" },
            { name: "Batch fix scans", slug: "/batch-fix-scans" },
          ],
        },
      ],
    },
    {
      label: "AI workflows",
      tier: "Plus",
      cols: [
        {
          heading: "Single-doc AI",
          items: [
            { name: "AI Workspace", slug: "/ai-workspace" },
            { name: "Chat with PDF", slug: "/chat-with-pdf" },
            { name: "PDF Summary", slug: "/ai-summary" },
            { name: "Translate PDF", slug: "/translate-pdf" },
            { name: "Contract Risk Check", slug: "/contract-risk" },
            { name: "Lease Red Flag Check", slug: "/lease-redflag" },
            { name: "Gov Bid Compliance", slug: "/govbid-matrix" },
          ],
        },
        {
          heading: "Multi-doc AI",
          items: [
            { name: "Compare documents", slug: "/compare" },
            { name: "Compare versions", slug: "/redline" },
            { name: "Extract to Excel", slug: "/extract-to-excel" },
            { name: "Batch summary", slug: "/batch-summary" },
            { name: "Classify PDFs", slug: "/batch-sort" },
          ],
        },
      ],
    },
    {
      label: "By profession",
      tier: "Soon",
      cols: [
        {
          items: [
            { name: "Legal & contracts", slug: "/for/legal" },
            { name: "Finance & tax", slug: "/for/finance" },
            { name: "Research & academia", slug: "/for/research" },
            { name: "Banking & finance", slug: "/pricing", soon: true },
            { name: "Architecture & engineering", slug: "/pricing", soon: true },
            { name: "Healthcare & medical", slug: "/pricing", soon: true },
          ],
        },
      ],
    },
  ],
  zh: [
    {
      label: "PDF 工具",
      tier: "Free",
      cols: [
        {
          heading: "转换",
          items: [
            { name: "PDF 转 Word", slug: "/pdf-to-word" },
            { name: "PDF 转 Excel", slug: "/pdf-to-excel" },
            { name: "PDF 转 PPT", slug: "/pdf-to-ppt" },
            { name: "PDF 转 PDF/A", slug: "/pdf-to-pdfa" },
            { name: "PDF 转图片", slug: "/pdf-to-image" },
            { name: "PDF 转 HTML", slug: "/pdf-to-html" },
            { name: "PDF 转 Markdown", slug: "/pdf-to-markdown" },
            { name: "Word 转 PDF", slug: "/word-to-pdf" },
            { name: "Excel 转 PDF", slug: "/excel-to-pdf" },
            { name: "PPT 转 PDF", slug: "/ppt-to-pdf" },
            { name: "图片转 PDF", slug: "/images-to-pdf" },
            { name: "HTML 转 PDF", slug: "/html-to-pdf" },
          ],
        },
        {
          heading: "整理",
          items: [
            { name: "PDF 拆分", slug: "/split-pdf" },
            { name: "PDF 压缩", slug: "/compress-pdf" },
            { name: "PDF 页面删除", slug: "/delete-page" },
            { name: "PDF 页面旋转", slug: "/rotate-page" },
            { name: "PDF 页面排序", slug: "/reorder-pages" },
            { name: "PDF 页面添加", slug: "/add-page" },
            { name: "PDF 加水印", slug: "/watermark-pdf" },
            { name: "PDF 添加页码", slug: "/page-numbers" },
            { name: "PDF 裁剪", slug: "/crop-pdf" },
            { name: "PDF 智能涂黑", slug: "/redact-pdf" },
            { name: "PDF 签名", slug: "/sign-pdf" },
          ],
        },
        {
          heading: "安全 & OCR",
          items: [
            { name: "PDF 加密", slug: "/protect-pdf" },
            { name: "PDF 解密", slug: "/unlock-pdf" },
            { name: "PDF OCR", slug: "/ocr-pdf" },
          ],
        },
      ],
    },
    {
      label: "批量处理",
      tier: "Plus",
      cols: [
        {
          items: [
            { name: "批量 PDF 合并", slug: "/merge-pdf" },
            { name: "批量 PDF 压缩", slug: "/batch-compress" },
            { name: "批量 PDF 转图片", slug: "/batch-pdf-to-image" },
            { name: "批量 PDF 加密", slug: "/batch-protect-pdf" },
            { name: "批量 PDF 改名", slug: "/batch-rename-pdf" },
            { name: "批量 PDF 添加水印", slug: "/batch-watermark-pdf" },
            { name: "批量 PDF 添加页码", slug: "/batch-page-numbers" },
            { name: "批量 PDF 拆分", slug: "/batch-split-merge" },
            { name: "批量 PDF 旋转", slug: "/batch-rotate-pdf" },
            { name: "批量 PDF 转 Word", slug: "/batch-pdf-to-word" },
            { name: "批量 PDF 转 Excel", slug: "/batch-pdf-to-excel" },
            { name: "批量 Word 转 PDF", slug: "/batch-word-to-pdf" },
            { name: "批量 Excel 转 PDF", slug: "/batch-excel-to-pdf" },
            { name: "批量 PPT 转 PDF", slug: "/batch-ppt-to-pdf" },
            { name: "批量翻译", slug: "/batch-translate" },
            { name: "批量修扫描", slug: "/batch-fix-scans" },
          ],
        },
      ],
    },
    {
      label: "AI 工作流",
      tier: "Plus",
      cols: [
        {
          heading: "单文档 AI",
          items: [
            { name: "AI 工作台", slug: "/ai-workspace" },
            { name: "PDF 问答", slug: "/chat-with-pdf" },
            { name: "PDF 摘要提取", slug: "/ai-summary" },
            { name: "PDF 翻译", slug: "/translate-pdf" },
            { name: "合同风险体检", slug: "/contract-risk" },
            { name: "租约红旗扫描", slug: "/lease-redflag" },
            { name: "政府标书合规矩阵", slug: "/govbid-matrix" },
          ],
        },
        {
          heading: "多文档 AI",
          items: [
            { name: "多文档对比", slug: "/compare" },
            { name: "PDF 版本对比", slug: "/redline" },
            { name: "数据抽取到表格", slug: "/extract-to-excel" },
            { name: "批量摘要", slug: "/batch-summary" },
            { name: "PDF 智能分类", slug: "/batch-sort" },
          ],
        },
      ],
    },
    {
      label: "专业领域",
      tier: "Soon",
      cols: [
        {
          items: [
            { name: "法律 / 合同", slug: "/for/legal" },
            { name: "财务 / 税务", slug: "/for/finance" },
            { name: "科研 / 学术", slug: "/for/research" },
            { name: "金融 / 投行", slug: "/pricing", soon: true },
            { name: "建筑 / 工程", slug: "/pricing", soon: true },
            { name: "医疗 / 健康", slug: "/pricing", soon: true },
          ],
        },
      ],
    },
  ],
  es: [
    {
      label: "Herramientas PDF",
      tier: "Free",
      cols: [
        {
          heading: "Convertir",
          items: [
            { name: "PDF a Word", slug: "/pdf-to-word" },
            { name: "PDF a Excel", slug: "/pdf-to-excel" },
            { name: "PDF a PPT", slug: "/pdf-to-ppt" },
            { name: "PDF a PDF/A", slug: "/pdf-to-pdfa" },
            { name: "PDF a imagen", slug: "/pdf-to-image" },
            { name: "PDF a HTML", slug: "/pdf-to-html" },
            { name: "PDF a Markdown", slug: "/pdf-to-markdown" },
            { name: "Word a PDF", slug: "/word-to-pdf" },
            { name: "Excel a PDF", slug: "/excel-to-pdf" },
            { name: "PPT a PDF", slug: "/ppt-to-pdf" },
            { name: "Imagen a PDF", slug: "/images-to-pdf" },
            { name: "HTML a PDF", slug: "/html-to-pdf" },
          ],
        },
        {
          heading: "Organizar",
          items: [
            { name: "Dividir PDF", slug: "/split-pdf" },
            { name: "Comprimir PDF", slug: "/compress-pdf" },
            { name: "Eliminar páginas", slug: "/delete-page" },
            { name: "Rotar páginas", slug: "/rotate-page" },
            { name: "Reordenar páginas", slug: "/reorder-pages" },
            { name: "Añadir página", slug: "/add-page" },
            { name: "Marca de agua en PDF", slug: "/watermark-pdf" },
            { name: "Añadir números de página", slug: "/page-numbers" },
            { name: "Recortar PDF", slug: "/crop-pdf" },
            { name: "Censurar PDF", slug: "/redact-pdf" },
            { name: "Firmar PDF", slug: "/sign-pdf" },
          ],
        },
        {
          heading: "Seguridad y OCR",
          items: [
            { name: "Proteger PDF", slug: "/protect-pdf" },
            { name: "Desbloquear PDF", slug: "/unlock-pdf" },
            { name: "OCR de PDF", slug: "/ocr-pdf" },
          ],
        },
      ],
    },
    {
      label: "Procesamiento por lotes",
      tier: "Plus",
      cols: [
        {
          items: [
            { name: "Combinar PDF", slug: "/merge-pdf" },
            { name: "Compresión por lotes", slug: "/batch-compress" },
            { name: "PDF a imagen por lotes", slug: "/batch-pdf-to-image" },
            { name: "Cifrado por lotes", slug: "/batch-protect-pdf" },
            { name: "Renombrado por lotes", slug: "/batch-rename-pdf" },
            { name: "Marca de agua por lotes", slug: "/batch-watermark-pdf" },
            { name: "Números de página por lotes", slug: "/batch-page-numbers" },
            { name: "División por lotes", slug: "/batch-split-merge" },
            { name: "Rotación por lotes", slug: "/batch-rotate-pdf" },
            { name: "PDF a Word por lotes", slug: "/batch-pdf-to-word" },
            { name: "PDF a Excel por lotes", slug: "/batch-pdf-to-excel" },
            { name: "Word a PDF por lotes", slug: "/batch-word-to-pdf" },
            { name: "Excel a PDF por lotes", slug: "/batch-excel-to-pdf" },
            { name: "PPT a PDF por lotes", slug: "/batch-ppt-to-pdf" },
            { name: "Traducir por lotes", slug: "/batch-translate" },
            { name: "Arreglar escaneos por lotes", slug: "/batch-fix-scans" },
          ],
        },
      ],
    },
    {
      label: "Flujos de trabajo con IA",
      tier: "Plus",
      cols: [
        {
          heading: "IA para un documento",
          items: [
            { name: "Espacio de trabajo IA", slug: "/ai-workspace" },
            { name: "Chatear con PDF", slug: "/chat-with-pdf" },
            { name: "Resumen de PDF", slug: "/ai-summary" },
            { name: "Traducir PDF", slug: "/translate-pdf" },
            { name: "Tarjetas de estudio de PDF", slug: "/flashcards" },
            { name: "Revisión de riesgos del contrato", slug: "/contract-risk" },
            { name: "Análisis de riesgos del arrendamiento", slug: "/lease-redflag" },
            { name: "Matriz de cumplimiento de licitación", slug: "/govbid-matrix" },
          ],
        },
        {
          heading: "IA para varios documentos",
          items: [
            { name: "Comparar documentos", slug: "/compare" },
            { name: "Comparar versiones", slug: "/redline" },
            { name: "Extraer a Excel", slug: "/extract-to-excel" },
            { name: "Resumen por lotes", slug: "/batch-summary" },
            { name: "Clasificar PDF", slug: "/batch-sort" },
          ],
        },
      ],
    },
    {
      label: "Por profesión",
      tier: "Soon",
      cols: [
        {
          items: [
            { name: "Legal y contratos", slug: "/for/legal" },
            { name: "Finanzas e impuestos", slug: "/for/finance" },
            { name: "Investigación y academia", slug: "/for/research" },
            { name: "Banca y finanzas", slug: "/pricing", soon: true },
            { name: "Arquitectura e ingeniería", slug: "/pricing", soon: true },
            { name: "Salud y medicina", slug: "/pricing", soon: true },
          ],
        },
      ],
    },
  ],
  pt: [
    {
      label: "Ferramentas PDF",
      tier: "Free",
      cols: [
        {
          heading: "Converter",
          items: [
            { name: "PDF para Word", slug: "/pdf-to-word" },
            { name: "PDF para Excel", slug: "/pdf-to-excel" },
            { name: "PDF para PPT", slug: "/pdf-to-ppt" },
            { name: "PDF para PDF/A", slug: "/pdf-to-pdfa" },
            { name: "PDF para imagem", slug: "/pdf-to-image" },
            { name: "PDF para HTML", slug: "/pdf-to-html" },
            { name: "PDF para Markdown", slug: "/pdf-to-markdown" },
            { name: "Word para PDF", slug: "/word-to-pdf" },
            { name: "Excel para PDF", slug: "/excel-to-pdf" },
            { name: "PPT para PDF", slug: "/ppt-to-pdf" },
            { name: "Imagem para PDF", slug: "/images-to-pdf" },
            { name: "HTML para PDF", slug: "/html-to-pdf" },
          ],
        },
        {
          heading: "Organizar",
          items: [
            { name: "Dividir PDF", slug: "/split-pdf" },
            { name: "Comprimir PDF", slug: "/compress-pdf" },
            { name: "Excluir páginas", slug: "/delete-page" },
            { name: "Girar páginas", slug: "/rotate-page" },
            { name: "Reordenar páginas", slug: "/reorder-pages" },
            { name: "Adicionar página", slug: "/add-page" },
            { name: "Marca d'água em PDF", slug: "/watermark-pdf" },
            { name: "Adicionar números de página", slug: "/page-numbers" },
            { name: "Recortar PDF", slug: "/crop-pdf" },
            { name: "Redigir PDF", slug: "/redact-pdf" },
            { name: "Assinar PDF", slug: "/sign-pdf" },
          ],
        },
        {
          heading: "Segurança e OCR",
          items: [
            { name: "Proteger PDF", slug: "/protect-pdf" },
            { name: "Desbloquear PDF", slug: "/unlock-pdf" },
            { name: "OCR de PDF", slug: "/ocr-pdf" },
          ],
        },
      ],
    },
    {
      label: "Processamento em lote",
      tier: "Plus",
      cols: [
        {
          items: [
            { name: "Unir PDF", slug: "/merge-pdf" },
            { name: "Compressão em lote", slug: "/batch-compress" },
            { name: "PDF para imagem em lote", slug: "/batch-pdf-to-image" },
            { name: "Criptografia em lote", slug: "/batch-protect-pdf" },
            { name: "Renomear em lote", slug: "/batch-rename-pdf" },
            { name: "Marca d'água em lote", slug: "/batch-watermark-pdf" },
            { name: "Números de página em lote", slug: "/batch-page-numbers" },
            { name: "Divisão em lote", slug: "/batch-split-merge" },
            { name: "Rotação em lote", slug: "/batch-rotate-pdf" },
            { name: "PDF para Word em lote", slug: "/batch-pdf-to-word" },
            { name: "PDF para Excel em lote", slug: "/batch-pdf-to-excel" },
            { name: "Word para PDF em lote", slug: "/batch-word-to-pdf" },
            { name: "Excel para PDF em lote", slug: "/batch-excel-to-pdf" },
            { name: "PPT para PDF em lote", slug: "/batch-ppt-to-pdf" },
            { name: "Traduzir em lote", slug: "/batch-translate" },
            { name: "Corrigir digitalizações em lote", slug: "/batch-fix-scans" },
          ],
        },
      ],
    },
    {
      label: "Fluxos de trabalho com IA",
      tier: "Plus",
      cols: [
        {
          heading: "IA para um documento",
          items: [
            { name: "Espaço de trabalho IA", slug: "/ai-workspace" },
            { name: "Chat com PDF", slug: "/chat-with-pdf" },
            { name: "Resumo de PDF", slug: "/ai-summary" },
            { name: "Traduzir PDF", slug: "/translate-pdf" },
            { name: "Flashcards de PDF", slug: "/flashcards" },
            { name: "Revisão de riscos do contrato", slug: "/contract-risk" },
            { name: "Análise de riscos do arrendamento", slug: "/lease-redflag" },
            { name: "Matriz de conformidade de licitação", slug: "/govbid-matrix" },
          ],
        },
        {
          heading: "IA para vários documentos",
          items: [
            { name: "Comparar documentos", slug: "/compare" },
            { name: "Comparar versões", slug: "/redline" },
            { name: "Extrair para Excel", slug: "/extract-to-excel" },
            { name: "Resumo em lote", slug: "/batch-summary" },
            { name: "Classificar PDF", slug: "/batch-sort" },
          ],
        },
      ],
    },
    {
      label: "Por profissão",
      tier: "Soon",
      cols: [
        {
          items: [
            { name: "Jurídico e contratos", slug: "/for/legal" },
            { name: "Finanças e impostos", slug: "/for/finance" },
            { name: "Pesquisa e academia", slug: "/for/research" },
            { name: "Banco e finanças", slug: "/pricing", soon: true },
            { name: "Arquitetura e engenharia", slug: "/pricing", soon: true },
            { name: "Saúde e medicina", slug: "/pricing", soon: true },
          ],
        },
      ],
    },
  ],
  fr: [
    {
      label: "Outils PDF",
      tier: "Free",
      cols: [
        {
          heading: "Convertir",
          items: [
            { name: "PDF en Word", slug: "/pdf-to-word" },
            { name: "PDF en Excel", slug: "/pdf-to-excel" },
            { name: "PDF en PPT", slug: "/pdf-to-ppt" },
            { name: "PDF en PDF/A", slug: "/pdf-to-pdfa" },
            { name: "PDF en image", slug: "/pdf-to-image" },
            { name: "PDF en HTML", slug: "/pdf-to-html" },
            { name: "PDF en Markdown", slug: "/pdf-to-markdown" },
            { name: "Word en PDF", slug: "/word-to-pdf" },
            { name: "Excel en PDF", slug: "/excel-to-pdf" },
            { name: "PPT en PDF", slug: "/ppt-to-pdf" },
            { name: "Image en PDF", slug: "/images-to-pdf" },
            { name: "HTML en PDF", slug: "/html-to-pdf" },
          ],
        },
        {
          heading: "Organiser",
          items: [
            { name: "Diviser PDF", slug: "/split-pdf" },
            { name: "Compresser PDF", slug: "/compress-pdf" },
            { name: "Supprimer des pages", slug: "/delete-page" },
            { name: "Faire pivoter des pages", slug: "/rotate-page" },
            { name: "Réorganiser les pages", slug: "/reorder-pages" },
            { name: "Ajouter une page", slug: "/add-page" },
            { name: "Filigrane PDF", slug: "/watermark-pdf" },
            { name: "Numéros de page", slug: "/page-numbers" },
            { name: "Rogner PDF", slug: "/crop-pdf" },
            { name: "Caviarder PDF", slug: "/redact-pdf" },
            { name: "Signer PDF", slug: "/sign-pdf" },
          ],
        },
        {
          heading: "Sécurité et OCR",
          items: [
            { name: "Protéger PDF", slug: "/protect-pdf" },
            { name: "Déverrouiller PDF", slug: "/unlock-pdf" },
            { name: "OCR PDF", slug: "/ocr-pdf" },
          ],
        },
      ],
    },
    {
      label: "Traitement par lots",
      tier: "Plus",
      cols: [
        {
          items: [
            { name: "Fusionner PDF", slug: "/merge-pdf" },
            { name: "Compression par lots", slug: "/batch-compress" },
            { name: "PDF en image par lots", slug: "/batch-pdf-to-image" },
            { name: "Chiffrement par lots", slug: "/batch-protect-pdf" },
            { name: "Renommage par lots", slug: "/batch-rename-pdf" },
            { name: "Filigrane par lots", slug: "/batch-watermark-pdf" },
            { name: "Numéros de page par lots", slug: "/batch-page-numbers" },
            { name: "Division par lots", slug: "/batch-split-merge" },
            { name: "Rotation par lots", slug: "/batch-rotate-pdf" },
            { name: "PDF en Word par lots", slug: "/batch-pdf-to-word" },
            { name: "PDF en Excel par lots", slug: "/batch-pdf-to-excel" },
            { name: "Word en PDF par lots", slug: "/batch-word-to-pdf" },
            { name: "Excel en PDF par lots", slug: "/batch-excel-to-pdf" },
            { name: "PPT en PDF par lots", slug: "/batch-ppt-to-pdf" },
            { name: "Traduction par lots", slug: "/batch-translate" },
            { name: "Corriger scans par lots", slug: "/batch-fix-scans" },
          ],
        },
      ],
    },
    {
      label: "Flux de travail IA",
      tier: "Plus",
      cols: [
        {
          heading: "IA pour un document",
          items: [
            { name: "Espace de travail IA", slug: "/ai-workspace" },
            { name: "Chat avec PDF", slug: "/chat-with-pdf" },
            { name: "Résumé PDF", slug: "/ai-summary" },
            { name: "Traduire PDF", slug: "/translate-pdf" },
            { name: "Flashcards PDF", slug: "/flashcards" },
            { name: "Analyse de risques du contrat", slug: "/contract-risk" },
            { name: "Signaux d'alerte du bail", slug: "/lease-redflag" },
            { name: "Matrice de conformité d'appel d'offres", slug: "/govbid-matrix" },
          ],
        },
        {
          heading: "IA pour plusieurs documents",
          items: [
            { name: "Comparer des documents", slug: "/compare" },
            { name: "Comparer des versions", slug: "/redline" },
            { name: "Extraire vers Excel", slug: "/extract-to-excel" },
            { name: "Résumé par lots", slug: "/batch-summary" },
            { name: "Classer PDF", slug: "/batch-sort" },
          ],
        },
      ],
    },
    {
      label: "Par profession",
      tier: "Soon",
      cols: [
        {
          items: [
            { name: "Juridique et contrats", slug: "/for/legal" },
            { name: "Finance et fiscalité", slug: "/for/finance" },
            { name: "Recherche et académique", slug: "/for/research" },
            { name: "Banque et finance", slug: "/pricing", soon: true },
            { name: "Architecture et ingénierie", slug: "/pricing", soon: true },
            { name: "Santé et médecine", slug: "/pricing", soon: true },
          ],
        },
      ],
    },
  ],
  ja: [
    {
      label: "PDFツール",
      tier: "Free",
      cols: [
        {
          heading: "変換",
          items: [
            { name: "PDF を Word に変換", slug: "/pdf-to-word" },
            { name: "PDF を Excel に変換", slug: "/pdf-to-excel" },
            { name: "PDF を PowerPoint に変換", slug: "/pdf-to-ppt" },
            { name: "PDF を PDF/A に変換", slug: "/pdf-to-pdfa" },
            { name: "PDF を画像に変換", slug: "/pdf-to-image" },
            { name: "PDF を HTML に変換", slug: "/pdf-to-html" },
            { name: "PDF を Markdown に変換", slug: "/pdf-to-markdown" },
            { name: "Word を PDF に変換", slug: "/word-to-pdf" },
            { name: "Excel を PDF に変換", slug: "/excel-to-pdf" },
            { name: "PowerPoint を PDF に変換", slug: "/ppt-to-pdf" },
            { name: "画像を PDF に変換", slug: "/images-to-pdf" },
            { name: "HTML を PDF に変換", slug: "/html-to-pdf" },
          ],
        },
        {
          heading: "編集・整理",
          items: [
            { name: "PDF を分割", slug: "/split-pdf" },
            { name: "PDF を圧縮", slug: "/compress-pdf" },
            { name: "ページを削除", slug: "/delete-page" },
            { name: "ページを回転", slug: "/rotate-page" },
            { name: "ページを並べ替え", slug: "/reorder-pages" },
            { name: "ページを追加", slug: "/add-page" },
            { name: "PDF に透かしを追加", slug: "/watermark-pdf" },
            { name: "ページ番号を追加", slug: "/page-numbers" },
            { name: "PDF をトリミング", slug: "/crop-pdf" },
            { name: "PDF を黒塗り", slug: "/redact-pdf" },
            { name: "PDF に署名", slug: "/sign-pdf" },
          ],
        },
        {
          heading: "セキュリティ・OCR",
          items: [
            { name: "PDF にパスワードを設定", slug: "/protect-pdf" },
            { name: "PDF のパスワードを解除", slug: "/unlock-pdf" },
            { name: "PDF を OCR（文字認識）", slug: "/ocr-pdf" },
          ],
        },
      ],
    },
    {
      label: "一括処理",
      tier: "Plus",
      cols: [
        {
          items: [
            { name: "PDF を結合", slug: "/merge-pdf" },
            { name: "一括圧縮", slug: "/batch-compress" },
            { name: "PDF を画像に一括変換", slug: "/batch-pdf-to-image" },
            { name: "一括暗号化", slug: "/batch-protect-pdf" },
            { name: "一括リネーム", slug: "/batch-rename-pdf" },
            { name: "一括透かし", slug: "/batch-watermark-pdf" },
            { name: "一括ページ番号", slug: "/batch-page-numbers" },
            { name: "一括分割", slug: "/batch-split-merge" },
            { name: "一括回転", slug: "/batch-rotate-pdf" },
            { name: "PDF を Word に一括変換", slug: "/batch-pdf-to-word" },
            { name: "PDF を Excel に一括変換", slug: "/batch-pdf-to-excel" },
            { name: "Word を PDF に一括変換", slug: "/batch-word-to-pdf" },
            { name: "Excel を PDF に一括変換", slug: "/batch-excel-to-pdf" },
            { name: "PowerPoint を PDF に一括変換", slug: "/batch-ppt-to-pdf" },
            { name: "一括翻訳", slug: "/batch-translate" },
            { name: "スキャンを一括補正", slug: "/batch-fix-scans" },
          ],
        },
      ],
    },
    {
      label: "AIワークフロー",
      tier: "Plus",
      cols: [
        {
          heading: "単一文書AI",
          items: [
            { name: "AI ワークスペース", slug: "/ai-workspace" },
            { name: "PDF とチャット", slug: "/chat-with-pdf" },
            { name: "PDF 要約", slug: "/ai-summary" },
            { name: "PDF を翻訳", slug: "/translate-pdf" },
            { name: "契約リスク診断", slug: "/contract-risk" },
            { name: "賃貸契約リスク診断", slug: "/lease-redflag" },
            { name: "入札要件コンプライアンス", slug: "/govbid-matrix" },
          ],
        },
        {
          heading: "複数文書AI",
          items: [
            { name: "文書を比較", slug: "/compare" },
            { name: "バージョンを比較", slug: "/redline" },
            { name: "Excel に抽出", slug: "/extract-to-excel" },
            { name: "一括要約", slug: "/batch-summary" },
            { name: "PDF を自動分類", slug: "/batch-sort" },
          ],
        },
      ],
    },
    {
      label: "業種別",
      tier: "Soon",
      cols: [
        {
          items: [
            { name: "法務・契約", slug: "/for/legal" },
            { name: "財務・税務", slug: "/for/finance" },
            { name: "研究・学術", slug: "/for/research" },
            { name: "銀行・金融", slug: "/pricing", soon: true },
            { name: "建築・エンジニアリング", slug: "/pricing", soon: true },
            { name: "医療・ヘルスケア", slug: "/pricing", soon: true },
          ],
        },
      ],
    },
  ],
};

const pageLinks = {
  en: [
    { name: "Pricing", href: "/pricing" },
    { name: "Guides", href: "/guides" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  zh: [
    { name: "定价", href: "/pricing" },
    { name: "指南", href: "/guides" },
    { name: "博客", href: "/blog" },
    { name: "关于", href: "/about" },
    { name: "联系", href: "/contact" },
  ],
  es: [
    { name: "Precios", href: "/pricing" },
    { name: "Guías", href: "/guides" },
    { name: "Blog", href: "/blog" },
    { name: "Acerca de", href: "/about" },
    { name: "Contacto", href: "/contact" },
  ],
  pt: [
    { name: "Preços", href: "/pricing" },
    { name: "Guias", href: "/guides" },
    { name: "Blog", href: "/blog" },
    { name: "Sobre", href: "/about" },
    { name: "Contato", href: "/contact" },
  ],
  fr: [
    { name: "Tarifs", href: "/pricing" },
    { name: "Guides", href: "/guides" },
    { name: "Blog", href: "/blog" },
    { name: "À propos", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
  ja: [
    { name: "料金", href: "/pricing" },
    { name: "ガイド", href: "/guides" },
    { name: "ブログ", href: "/blog" },
    { name: "会社概要", href: "/about" },
    { name: "お問い合わせ", href: "/contact" },
  ],
} as const;

type Locale = "en" | "zh";

function stripLocale(p: string): "en" | "zh" | "es" | "pt" | "fr" | "ja" {
  const s = p.split("/").filter(Boolean);
  const first = s[0];
  return first === "zh" || first === "es" || first === "pt" || first === "fr" || first === "ja" ? first : "en";
}
function lh(h: string, l: string) {
  return l === defaultLocale ? h : `/${l}${h}`;
}
function currentSlug(pathname: string | null) {
  const segs = (pathname ?? "/").split("/").filter(Boolean);
  const rest = isAllLocale(segs[0]) ? segs.slice(1) : segs;
  return rest.join("/");
}

const HEADER_H = 52; // px — must match h-[52px] below

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [light, setLight] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const locale = stripLocale(pathname ?? "/");

  const cats = navCategories[locale] ?? navCategories.en;
  const pages = pageLinks[locale] ?? pageLinks.en;

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);
  useEffect(() => {
    let mounted = true;
    getUser().then((u) => { if (mounted) setAuthUser(u); }).catch(() => {});
    const unsub = onAuthChange((u) => { if (mounted) setAuthUser(u); });
    return () => { mounted = false; unsub(); };
  }, []);
  useEffect(() => { setMobileOpen(false); setMoreOpen(false); setLangOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function toggleTheme() {
    const n = !light;
    setLight(n);
    document.documentElement.classList.toggle("light", n);
    try { localStorage.setItem("dockdocs-theme", n ? "light" : "dark"); } catch {}
  }

  function navTo(href: string) {
    router.push(lh(href, locale));
  }

  function switchLang(target: string) {
    if (target === locale) return;
    const slug = currentSlug(pathname);
    const href = target === defaultLocale ? `/${slug}` : `/${target}/${slug}`;
    try { localStorage.setItem("dockdocs-lang", target); } catch {}
    setMoreOpen(false);
    setMobileOpen(false);
    router.push(href || "/");
  }

  const trigger =
    "flex items-center gap-1 rounded-[var(--radius-sm)] px-3 py-2 text-[15px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)] cursor-pointer";
  const itemCls =
    "block w-full whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-[14.5px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]";
  const iconBtn =
    "inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] text-sm transition hover:border-[color:var(--line-strong)]";

  // Language selector — desktop: flyout panel to the left; mobile: inline vertical expand
  const langDropdownDesktop = (
    <div className="relative">
      <button
        type="button"
        onClick={() => setLangOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
      >
        <svg className="h-3 w-3 opacity-60" style={{ transform: 'rotate(90deg)' }} viewBox="0 0 12 12" fill="none">
          <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>{locale === "zh" ? "语言" : locale === "es" ? "Idioma" : locale === "pt" ? "Idioma" : locale === "fr" ? "Langue" : "Language"}</span>
      </button>
      {langOpen && (
        <div className="absolute right-full bottom-0 z-10 mr-1 min-w-[180px] rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)] p-1 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
          {(routeLocales as readonly string[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => { switchLang(l); setLangOpen(false); }}
              className={`flex w-full items-center justify-between rounded-[var(--radius-sm)] px-3 py-1.5 text-left text-[13px] font-medium transition ${
                l === locale
                  ? "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]"
                  : "text-[color:var(--muted)] hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
              }`}
            >
              {localeLabels[l as keyof typeof localeLabels]}
              {l === locale && <span className="text-[color:var(--accent)]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const langDropdown = (
    <div>
      <button
        type="button"
        onClick={() => setLangOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
      >
        <span>{locale === "zh" ? "语言" : locale === "es" ? "Idioma" : locale === "pt" ? "Idioma" : locale === "fr" ? "Langue" : "Language"}</span>
        <span className="flex items-center gap-1.5">
          <span className="text-[12px] text-[color:var(--faint)]">{localeLabels[locale as keyof typeof localeLabels] ?? locale}</span>
          <svg className={`h-3 w-3 transition-transform ${langOpen ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none">
            <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {langOpen && (
        <div className="mt-0.5 space-y-0.5 px-1 pb-1">
          {(routeLocales as readonly string[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => { switchLang(l); setLangOpen(false); }}
              className={`flex w-full items-center justify-between rounded-[var(--radius-sm)] px-3 py-1.5 text-left text-[13px] font-medium transition ${
                l === locale
                  ? "bg-[color:var(--soft-accent)] text-[color:var(--accent-strong)]"
                  : "text-[color:var(--muted)] hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
              }`}
            >
              {localeLabels[l as keyof typeof localeLabels]}
              {l === locale && <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Fixed header bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[color:var(--line)] bg-[color:var(--background)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[52px] max-w-6xl items-center px-4 lg:px-6">
          {/* Logo */}
          <a href={lh("/", locale)} className="mr-3 shrink-0">
            <BrandMark />
          </a>

          {/* Desktop nav — 4 category dropdowns */}
          <nav className="hidden flex-1 items-center justify-center gap-x-6 lg:gap-x-10 md:flex">
            {cats.map((cat) => (
              <div key={cat.label} className="relative group">
                <span className={trigger}>
                  {cat.label}
                  <svg className="h-3 w-3 opacity-60 transition group-hover:rotate-180" viewBox="0 0 12 12" fill="none">
                    <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <div className="absolute left-0 top-full z-50 hidden w-max pt-2 group-hover:block">
                  <div className="rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)] p-4 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                    <div
                      className="grid gap-x-7 gap-y-3"
                      style={{ gridTemplateColumns: `repeat(${cat.cols.length}, auto)` }}
                    >
                      {cat.cols.map((col, ci) => (
                        <div key={col.heading ?? ci} className="min-w-[168px]">
                          {col.heading && (
                            <p className="mb-2 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                              {col.heading}
                            </p>
                          )}
                          <div className="space-y-0.5">
                            {col.items.map((item, ii) =>
                              item.soon ? (
                                <span key={`${item.slug}-${ii}`} className="flex w-full cursor-default items-center justify-between gap-3 whitespace-nowrap rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-[14.5px] font-medium text-[color:var(--faint)]">
                                  {item.name}
                                  <span className="text-[10px] font-semibold uppercase opacity-80">{locale === "zh" ? "正在开发" : "soon"}</span>
                                </span>
                              ) : (
                                <a key={`${item.slug}-${ii}`} href={lh(item.slug, locale)} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo(item.slug); }} className={itemCls}>
                                  {item.name}
                                </a>
                              ),
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1.5">
            {/* Sign in / Account (desktop) */}
            <button
              type="button"
              onClick={() => navTo("/account")}
              className="hidden rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-1.5 text-[13px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)] md:inline-flex"
            >
              {authUser
                ? (authUser.name ?? authUser.email ?? (locale === "zh" ? "账户" : locale === "es" ? "Cuenta" : locale === "pt" ? "Conta" : locale === "fr" ? "Compte" : "Account"))
                : (locale === "zh" ? "登录" : locale === "es" ? "Iniciar sesión" : locale === "pt" ? "Entrar" : locale === "fr" ? "Connexion" : "Sign in")}
            </button>

            {/* Consolidated "More" menu (desktop) — Pricing/Blog/About + language + theme */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-label={locale === "zh" ? "更多" : "More"}
                aria-expanded={moreOpen}
                className={iconBtn}
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setMoreOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1.5 w-[160px] rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
                    {pages.map((p) => (
                      <a
                        key={p.href}
                        href={lh(p.href, locale)}
                        onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo(p.href); setMoreOpen(false); }}
                        className="block w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                      >
                        {p.name}
                      </a>
                    ))}
                    <div className="my-1.5 border-t border-[color:var(--line)]" />
                    {langDropdownDesktop}
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left text-[13px] font-medium text-[color:var(--muted)] transition hover:bg-[color:var(--surface-subtle)] hover:text-[color:var(--foreground)]"
                    >
                      <span className="text-[14px] opacity-70">{light ? "☀" : "☾"}</span>
                      <span>{locale === "zh" ? (light ? "浅色" : "深色") : light ? "Light" : "Dark"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] text-[color:var(--foreground)] md:hidden"
            >
              {mobileOpen ? (
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Spacer so content doesn't hide under fixed header */}
      <div className="h-[52px]" aria-hidden="true" />

      {/* ── Mobile full-screen menu ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col md:hidden" style={{ top: `${HEADER_H}px` }}>
          <div className="flex-1 overflow-y-auto bg-[color:var(--background)]">
            <div className="px-4 pb-8 pt-4">

              {/* Language + theme + sign-in */}
              <div className="mb-5 overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--background)]">
                {langDropdown}
                <div className="flex items-center gap-2 border-t border-[color:var(--line)] px-3 py-2">
                  <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className={`${iconBtn} bg-[color:var(--background)]`}>
                    {light ? "☾" : "☀"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { navTo("/account"); setMobileOpen(false); }}
                    className="ml-auto rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-1.5 text-[13px] font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--line-strong)]"
                  >
                    {authUser
                      ? (authUser.name ?? authUser.email ?? (locale === "zh" ? "账户" : locale === "es" ? "Cuenta" : locale === "pt" ? "Conta" : locale === "fr" ? "Compte" : "Account"))
                      : (locale === "zh" ? "登录" : locale === "es" ? "Iniciar sesión" : locale === "pt" ? "Entrar" : locale === "fr" ? "Connexion" : "Sign in")}
                  </button>
                </div>
              </div>

              {/* Quick links — Pricing / Blog / About */}
              <div className="mb-5">
                <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                  {locale === "zh" ? "更多" : "More"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {pages.map((p) => (
                    <a
                      key={p.href}
                      href={lh(p.href, locale)}
                      onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo(p.href); setMobileOpen(false); }}
                      className="rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-2 text-[14px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
                    >
                      {p.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-5">
                {cats.map((cat) => (
                  <div key={cat.label}>
                    <p className="mb-2.5 flex items-center gap-1.5 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--faint)]">
                      {cat.label}
                    </p>
                    {cat.cols.map((col, ci) => (
                      <div key={col.heading ?? ci} className="mb-2.5">
                        {col.heading && (
                          <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--faint)] opacity-70">
                            {col.heading}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-1.5">
                          {col.items.map((item, ii) =>
                            item.soon ? (
                              <span key={`${item.slug}-${ii}`} className="flex w-full cursor-default items-center justify-between gap-1 rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-2.5 text-left text-[14px] font-medium text-[color:var(--faint)]">
                                {item.name}
                                <span className="text-[10px] font-semibold uppercase opacity-80">{locale === "zh" ? "正在开发" : "soon"}</span>
                              </span>
                            ) : (
                              <a
                                key={`${item.slug}-${ii}`}
                                href={lh(item.slug, locale)}
                                onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); navTo(item.slug); setMobileOpen(false); }}
                                className="block w-full rounded-[var(--radius-sm)] border border-[color:var(--line)] bg-[color:var(--background)] px-3 py-2.5 text-left text-[14px] font-medium text-[color:var(--muted)] transition hover:border-[color:var(--line-strong)] hover:text-[color:var(--foreground)]"
                              >
                                {item.name}
                              </a>
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
