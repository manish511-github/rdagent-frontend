import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type CompetitorAnalysisApi = any

interface CompetitorAnalysisState {
  overview: any | null
  features: { features: any[]; summary_analysis?: any } | null
  youtube: any | null
  news: any | null
  pricing: any | null
  analysisInfo: any | null
  sourceIds: any | null
  twitter: any | null
  facebook: any | null
}

const initialState: CompetitorAnalysisState = {
  overview: null,
  features: null,
  youtube: null,
  news: null,
  pricing: null,
  analysisInfo: null,
  sourceIds: null,
  twitter: null,
  facebook: null,
}

const competitorAnalysisSlice = createSlice({
  name: "competitorAnalysis",
  initialState,
  reducers: {
    setAnalysisFromApi(state, action: PayloadAction<{ api: CompetitorAnalysisApi }>) {
      const { api } = action.payload
      const data = api?.data ?? {}
      const competitor = data?.competitor ?? {}
      const analyses = competitor?.analyses ?? {}
      const features = analyses?.features
      const overview = analyses?.overview ?? data?.overview
      const youtube = analyses?.social_media?.youtube ?? data?.social_media?.youtube
      const news = analyses?.news?.report ?? data?.news?.report
      const pricing = analyses?.pricing ?? data?.pricing

      const analysisInfo = data?.analysis_info
      const sourceIds = data?.source_ids
      const twitter = analyses?.social_media?.twitter ?? data?.social_media?.twitter
      const facebook = analyses?.social_media?.facebook ?? data?.social_media?.facebook

      state.overview = overview ?? null
      state.features = features?.features ? { features: features.features, summary_analysis: features.summary_analysis } : null
      state.youtube = youtube ?? null
      state.news = news ?? null
      state.pricing = pricing ?? null
      state.analysisInfo = analysisInfo ?? null
      state.sourceIds = sourceIds ?? null
      state.twitter = twitter ?? null
      state.facebook = facebook ?? null
    },
    clearAnalysis(state) {
      Object.assign(state, initialState)
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const { setAnalysisFromApi, clearAnalysis, clearAll } = competitorAnalysisSlice.actions

export default competitorAnalysisSlice.reducer

export type RootStateLike = {
  competitorAnalysis: CompetitorAnalysisState
}

export const selectOverview = (state: RootStateLike) => state.competitorAnalysis.overview
export const selectFeatures = (state: RootStateLike) => state.competitorAnalysis.features
export const selectYouTube = (state: RootStateLike) => state.competitorAnalysis.youtube
export const selectNews = (state: RootStateLike) => state.competitorAnalysis.news
export const selectPricing = (state: RootStateLike) => state.competitorAnalysis.pricing
export const selectTwitter = (state: RootStateLike) => state.competitorAnalysis.twitter
export const selectFacebook = (state: RootStateLike) => state.competitorAnalysis.facebook

