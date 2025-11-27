export const SAI_CONFIG = {
  apiKey: process.env.SAI_API_KEY || '',
  baseUrl: 'https://sai-library.saiapplications.com/api/templates',
  templates: {
    edps: '69132d45057530242d71a7c6', // Criador de norma - EDP
    dfmea: '69137dd6861d3932bb6e6a00', // Criador de falhas - DFMEA
    dvp: '6913977b057530242d720f2c'    // Criador de testes - DVP
  }
}

