import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type CompetitorAnalysisApi = any

interface CompetitorAnalysisState {
  overviewByKey: Record<string, any>
  featuresByKey: Record<string, { features: any[]; summary_analysis?: any }>
  youtubeByKey: Record<string, any>
  newsByKey: Record<string, any>
  pricingByKey: Record<string, any>
  analysisInfoByKey: Record<string, any>
  sourceIdsByKey: Record<string, any>
  twitterByKey: Record<string, any>
  facebookByKey: Record<string, any>
}

const initialState: CompetitorAnalysisState = {
  overviewByKey: {},
  featuresByKey: {},
  youtubeByKey: {},
  newsByKey: {},
  pricingByKey: {},
  analysisInfoByKey: {},
  sourceIdsByKey: {},
  twitterByKey: {},
  facebookByKey: {},
}

const competitorAnalysisSlice = createSlice({
  name: "competitorAnalysis",
  initialState,
  reducers: {
    setAnalysisFromApi(
      state,
      action: PayloadAction<{ key: string; api: CompetitorAnalysisApi }>,
    ) {
      const { key, api } = action.payload
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

      if (overview) state.overviewByKey[key] = overview
      if (features?.features) state.featuresByKey[key] = { features: features.features, summary_analysis: features.summary_analysis }
      if (youtube) state.youtubeByKey[key] = youtube
      if (news) state.newsByKey[key] = news
      if (pricing) state.pricingByKey[key] = pricing
      if (analysisInfo) state.analysisInfoByKey[key] = analysisInfo
      if (sourceIds) state.sourceIdsByKey[key] = sourceIds
      if (twitter) state.twitterByKey[key] = twitter
      if (facebook) state.facebookByKey[key] = facebook
    },
    clearAnalysis(state, action: PayloadAction<{ key: string }>) {
      const { key } = action.payload
      delete state.overviewByKey[key]
      delete state.featuresByKey[key]
      delete state.youtubeByKey[key]
      delete state.newsByKey[key]
      delete state.pricingByKey[key]
      delete state.analysisInfoByKey[key]
      delete state.sourceIdsByKey[key]
      delete state.twitterByKey[key]
      delete state.facebookByKey[key]
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

export const selectOverviewByKey = (key: string) => (state: RootStateLike) => state.competitorAnalysis.overviewByKey[key]
export const selectFeaturesByKey = (key: string) => (state: RootStateLike) => state.competitorAnalysis.featuresByKey[key]
export const selectYouTubeByKey = (key: string) => (state: RootStateLike) => state.competitorAnalysis.youtubeByKey[key]
export const selectNewsByKey = (key: string) => (state: RootStateLike) => state.competitorAnalysis.newsByKey[key]
export const selectPricingByKey = (key: string) => (state: RootStateLike) => state.competitorAnalysis.pricingByKey[key]
export const selectTwitterByKey = (key: string) => (state: RootStateLike) => state.competitorAnalysis.twitterByKey[key]
export const selectFacebookByKey = (key: string) => (state: RootStateLike) => state.competitorAnalysis.facebookByKey[key]

