//

import { isUser } from './lib.mjs';
import { get } from 'svelte/store';
import { campaign } from '../stores.mjs';

/*
  Try to find a campaign. Look first in person otherwise look among
  open campaigns.

  @param {person} -- possibly undefined
  @param {string} campaignName 
  @returns {Campaign} or undefined

*/

export async function fetchCampaign (person, campaignName) {
    if ( get(campaign) ) {
        return get(campaign);
    }
    const state = CodeGradX.getCurrentState();
    if ( isUser(person) ) {
        try {
            const campaign = await person.getCampaign(campaignName);
            state.currentCampaignName = campaignName;
            state.currentCampaign = campaign;
            return campaign;
        } catch (_) {
            return undefined;
        }
    } else {
        const campaigns = await state.getOpenCampaigns();
        const campaign = campaigns[campaignName];
        state.currentCampaignName = campaignName;
        state.currentCampaign = campaign;
        return campaign;
    }
}

// end of campaignlib.mjs
