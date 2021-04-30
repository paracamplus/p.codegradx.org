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
    if ( false && get(campaign) ) {
        return get(campaign);
    }
    const state = CodeGradX.getCurrentState();
    //console.log({person});//DEBUG
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

/** 
    Given an ExercisesSet, return an object filled with all mentioned
    exercises. 

    @returns Object mapping exercise.exerciseid (an UUID) to exercise

 */

export function flattenExercisesSet (exercisesSet) {
    const exercises = {};
    if ( exercisesSet.exercises ) {
        for ( const es of exercisesSet.exercises ) {
            if ( es instanceof CodeGradX.ExercisesSet ) {
                const otherexercises = flattenExercisesSet(es);
                for ( const e of otherexercises ) {
                    exercises[e.exerciseid] = e;
                }
            } else if ( es instanceof CodeGradX.Exercise ) {
                exercises[es.exerciseid] = es;
            }
        }
    }
    return exercises;
}

// end of campaignlib.mjs
