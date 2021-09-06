//

import { isUser } from './lib.mjs';
import { get } from 'svelte/store';
import { campaign } from '../stores.mjs';
import { CodeGradX } from 'codegradx';

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
   Ensure a person is enrolled in an open campaign.

   @returns {User}
*/

export async function register_in_open_campaign (person, campaignName) {
    const state = CodeGradX.getCurrentState();
    const response = await state.sendAXServer('x', {
        path: `/fromp/openregistration/${campaignName}`,
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    if ( response.ok ) {
        state.currentUser = new CodeGradX.User(response.entity);
        return state.currentUser;
    } else {
        throw response;
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
                Object.assign(exercises, otherexercises);
            } else if ( es instanceof CodeGradX.Exercise ) {
                exercises[es.exerciseid] = es;
            }
        }
    }
    return exercises;
}

// end of campaignlib.mjs
