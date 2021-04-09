<style>
 tr.obsolete {
   background-color: var(--color-hover-gray);
 }
 a.internal {
   color: black;
   text-decoration: none;
 }
</style>

<div class='w3-container'>
  <p class='smallHint'>Cliquer sur la ligne présente les exercices que
    procure l'univers. Cliquer sur le lien si présent mène au site
    original de l'univers concerné. </p>
  <table class='w3-table w3-hoverable'>
    <thead>
      <tr class='w3-theme-l3'><th>Univers</th><th></th>
        <th class='w3-hide-small'>Début</th>
        <th class='w3-hide-small'>Fin</th></tr>
    </thead>
    <tbody>
      {#each campaigns as campaign}
      <tr class:obsolete={! campaign.active}
          title={`Voir les exercices de ${campaign.name}`}
          on:click={see(campaign)} >
        <td>{#if ! campaign.open}
              <a href={campaign.home_url}
                 title={`Voir le site original ${campaign.title}`}>
                {campaign.name}</a>
            {:else}
             <a href={buildGoto(`universe/${campaign.name}`)}
                class='internal'
                title={campaign.title}>
               {campaign.name}</a>
            {/if}
          <span class='w3-right'>{#if campaign.isTeacher}
            <span title="Vous y êtes enseignant">🎓</span>{/if}</span></td>
        <td>{campaign.title}</td>
        <td class='w3-hide-small'>
          {CodeGradX.Date2str(campaign.starttime).replace(/T.*$/, '')}</td>
        <td class='w3-hide-small'>
          {CodeGradX.Date2str(campaign.endtime).replace(/T.*$/, '')}</td>
      </tr>
      {/each}
    </tbody>
  </table>
</div>

<script>
 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { campaign } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { goto } from '../client/lib.mjs';
 import { buildGoto } from '../client/lib.mjs';
 
 export let campaigns = [];

 onMount(async () => {
   $campaign = undefined;
 });
 
 function see (thecampaign) {
   return function (event) {
     event.preventDefault();
     event.stopPropagation();
     $campaign = thecampaign;
     goto(`/universe/${thecampaign.name}`);
   };
 }
  
</script>
