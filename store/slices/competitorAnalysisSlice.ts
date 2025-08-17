import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"

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

// Thunk to load competitor analysis from API
export const loadCompetitorAnalysis = createAsyncThunk<
  CompetitorAnalysisApi,
  { projectId: string; ourUrl?: string; competitorUrl?: string; userId?: number }
>(
  "competitorAnalysis/load",
  async ({ projectId, ourUrl, competitorUrl, userId }, { signal }) => {
    const res = await fetch(`http://localhost:8001/company/competitor/analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        our_url: ourUrl,
        competitor_url: competitorUrl,
        user_id: userId,
      }),
      signal,
    })
    if (!res.ok) throw new Error("Failed to load competitor analysis")
    const api = (await res.json()) as CompetitorAnalysisApi
    return api
  },
)

// Helper to map API payload to state
function applyApiToState(state: CompetitorAnalysisState, api: CompetitorAnalysisApi) {
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
}

const competitorAnalysisSlice = createSlice({
  name: "competitorAnalysis",
  initialState,
  reducers: {
    setAnalysisFromApi(state, action: PayloadAction<{ api: CompetitorAnalysisApi }>) {
      const { api } = action.payload
      applyApiToState(state, api)
    },
    clearAnalysis(state) {
      Object.assign(state, initialState)
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loadCompetitorAnalysis.fulfilled, (state, action) => {
      applyApiToState(state, action.payload)
    })
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

