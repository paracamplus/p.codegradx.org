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
  <table class='w3-table w3-hoverable'>
    <thead>
      <tr class='w3-theme-d2'><th>Univers</th><th></th>
        <th class='w3-hide-small'>Début</th>
        <th class='w3-hide-small'>Fin</th></tr>
    </thead>
    <tbody>
      {#each campaigns as campaign}
      <tr class:obsolete={! campaign.active}
          title="Voir les exercices..."
          on:click={see(campaign)} >
        <td>{#if ! campaign.open}
             <a href='{campaign.home_url}' title={campaign.title}>
               {campaign.name}</a>
            {:else}
             <a href='/universe/{campaign.name}'
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
 
 export let campaigns = [];

 onMount(async () => {
   $campaign = undefined;
 });
 
 function see (thecampaign) {
   return function (event) {
     event.preventDefault();
     event.stopPropagation();
     $campaign = thecampaign;
     sapper.goto(`/universe/${thecampaign.name}`);
   };
 }
  
</script>
