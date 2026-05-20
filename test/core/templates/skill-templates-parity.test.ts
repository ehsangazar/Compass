import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  type SkillTemplate,
  getApplyChangeSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getExploreSkillTemplate,
  getFeedbackSkillTemplate,
  getFfChangeSkillTemplate,
  getNewChangeSkillTemplate,
  getOnboardSkillTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxArchiveCommandTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxNewCommandTemplate,
  getOpsxOnboardCommandTemplate,
  getOpsxSyncCommandTemplate,
  getOpsxProposeCommandTemplate,
  getOpsxProposeSkillTemplate,
  getOpsxVerifyCommandTemplate,
  getSyncSpecsSkillTemplate,
  getVerifyChangeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { generateSkillContent } from '../../../src/core/shared/skill-generation.js';

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getApplyChangeSkillTemplate: 'f5bbf155bbb42c87edaed6836cc917762b236c0717ad6a35f55b27084082c7d9',
  getArchiveChangeSkillTemplate: 'c1ed52c46dc2561296597a36275a8d773bd69edbb4dbecccb1e28b25bc3b2521',
  getBulkArchiveChangeSkillTemplate: 'de7abd74c7e346d76238bedccc1d6edc603227acd4a828ebdd1f57dc5535a4bb',
  getContinueChangeSkillTemplate: '2351f7323d70572c7b951524a12f365ae3496c1d98cbb6b3b15e9b6a116f76d3',
  getExploreSkillTemplate: '5b053644744c2dbd6ad17f002f01537149ba21e605e5c92147783fea80807167',
  getFeedbackSkillTemplate: '4094fab6f15b64e282b88a49cfaded78220f3201bdd7a813658b59963455ecaa',
  getFfChangeSkillTemplate: '3355d098cf79a67526c17b1047cbba64524550cb863e151215a7f3dba032f24a',
  getNewChangeSkillTemplate: 'a1ecfff042c38d782a88a8340c3c9702fbec85bb7fb80f5310c6e2724567aa15',
  getOnboardSkillTemplate: '9d069349e7318d917761289dddc06b28183b8e962eb7029992d3047919ef9b89',
  getOpsxApplyCommandTemplate: 'f07c046c37c7f94352d71277e6e6fb7adf86d22e440709aefc8d8709b8b317ab',
  getOpsxArchiveCommandTemplate: '70ecfa7965ad3abf8d61c475db937129b8bf4049d393b66a67055ef7e67c4427',
  getOpsxBulkArchiveCommandTemplate: '725e26f11e16813c870c60c0cab4eca1f7c78b1782e3be32dcc9ca34887e2818',
  getOpsxContinueCommandTemplate: '550b7d077774e91049b83752b54ae1dfda3aaa49f35027e3dfa9a6534e2f084f',
  getOpsxExploreCommandTemplate: '2987f720939f5e143227819c280643cacfd502138ed97c5ae7816577cd975279',
  getOpsxFfCommandTemplate: 'b6c8ece7123f4763da2a8d2b3f927c969a14118d8fbc7ba6a461a2cb7318bf33',
  getOpsxNewCommandTemplate: '15344f60679ee473b30f127a6f16989afd15401db6541217c49c197eb8d5b952',
  getOpsxOnboardCommandTemplate: 'c779c444f4d936af2dd7da7fcb1dfa78d03c92303c55b3289e75685ca76cdc9b',
  getOpsxProposeCommandTemplate: 'e79276f8950bc3a3fe03b09ac44ad3a32219e2076d5bde64e831db430340042f',
  getOpsxProposeSkillTemplate: 'ae9bd652fe7c0d03366f3d59fb973ec1c9a98e5f351e33eb9544bcfc48352dea',
  getOpsxSyncCommandTemplate: '011cb3a48cde52ce41221ad5d0179b81b5f1ae6ccad0eff747be9acc0f91ecca',
  getOpsxVerifyCommandTemplate: '90f67863a47245830031e839fa2c0bb6e0010d8bde9523bc3f92ec70faf00c20',
  getSyncSpecsSkillTemplate: '7fefe46c0aec0d89c2dec1957c2d4c1d372c13b841516f5fdb2b37172d5b0512',
  getVerifyChangeSkillTemplate: '9c9a96441f0feafbd14d0bcaf58dd39f557533e82ee50e2e98d49ca68e802d52',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'compass-apply-change': '38ad98a94d77fa95461edce5c01a9ba8723fdcfb865f7f0a631edcce5a13a9ae',
  'compass-archive-change': '6ebb8be4459cb52bf57536468f76453050bbcc8096a954c3b40681054558092f',
  'compass-bulk-archive-change': '7028b9a4437f66883a2c0452a36f2d8c7e27b08330326e492500ccbaa16bd77b',
  'compass-continue-change': '071ac1868414e6e8856a66b4e1ec6dceaf2b1e0fe4288f71ac5fb96451c0c78a',
  'compass-explore': '90e0c0b97a7cd6c10f6a20e68a02f0982541a21dba6f1d2b811b7b3856500727',
  'compass-ff-change': '978e6649296037d181095fc4a5ec84ee3be420d24441d651977ccfe98cb53faa',
  'compass-new-change': '6e8cbbf96793272cab6a1f579b2128a7aa8ac343f2ecdd70ccd12a941db3f189',
  'compass-onboard': '1faf2e54fed49f8f234fc02cec92f5472689bf4ecdd8081d2d80316c33841ea9',
  'compass-propose': 'dbfae7e32f6fb5c0ce1cdee415de135febff130e31d12d86ee20d2a459187c3f',
  'compass-sync-specs': '50b3c36bc7a53936b91101f8373f85ccfa0e8dcdd74c078c3b720c735b79fe4d',
  'compass-verify-change': 'b4934615abf67a52b2b7c809fd3a9bb76e6c9998adc619bf6ae655eb4e4ab6ae',
};

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value);
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('skill templates split parity', () => {
  it('preserves all template function payloads exactly', () => {
    const functionFactories: Record<string, () => unknown> = {
      getExploreSkillTemplate,
      getNewChangeSkillTemplate,
      getContinueChangeSkillTemplate,
      getApplyChangeSkillTemplate,
      getFfChangeSkillTemplate,
      getSyncSpecsSkillTemplate,
      getOnboardSkillTemplate,
      getOpsxExploreCommandTemplate,
      getOpsxNewCommandTemplate,
      getOpsxContinueCommandTemplate,
      getOpsxApplyCommandTemplate,
      getOpsxFfCommandTemplate,
      getArchiveChangeSkillTemplate,
      getBulkArchiveChangeSkillTemplate,
      getOpsxSyncCommandTemplate,
      getVerifyChangeSkillTemplate,
      getOpsxArchiveCommandTemplate,
      getOpsxOnboardCommandTemplate,
      getOpsxBulkArchiveCommandTemplate,
      getOpsxVerifyCommandTemplate,
      getOpsxProposeSkillTemplate,
      getOpsxProposeCommandTemplate,
      getFeedbackSkillTemplate,
    };

    const actualHashes = Object.fromEntries(
      Object.entries(functionFactories).map(([name, fn]) => [name, hash(stableStringify(fn()))])
    );

    expect(actualHashes).toEqual(EXPECTED_FUNCTION_HASHES);
  });

  it('preserves generated skill file content exactly', () => {
    // Intentionally excludes getFeedbackSkillTemplate: skillFactories only models templates
    // deployed via generateSkillContent, while feedback is covered in function payload parity.
    const skillFactories: Array<[string, () => SkillTemplate]> = [
      ['compass-explore', getExploreSkillTemplate],
      ['compass-new-change', getNewChangeSkillTemplate],
      ['compass-continue-change', getContinueChangeSkillTemplate],
      ['compass-apply-change', getApplyChangeSkillTemplate],
      ['compass-ff-change', getFfChangeSkillTemplate],
      ['compass-sync-specs', getSyncSpecsSkillTemplate],
      ['compass-archive-change', getArchiveChangeSkillTemplate],
      ['compass-bulk-archive-change', getBulkArchiveChangeSkillTemplate],
      ['compass-verify-change', getVerifyChangeSkillTemplate],
      ['compass-onboard', getOnboardSkillTemplate],
      ['compass-propose', getOpsxProposeSkillTemplate],
    ];

    const actualHashes = Object.fromEntries(
      skillFactories.map(([dirName, createTemplate]) => [
        dirName,
        hash(generateSkillContent(createTemplate(), 'PARITY-BASELINE')),
      ])
    );

    expect(actualHashes).toEqual(EXPECTED_GENERATED_SKILL_CONTENT_HASHES);
  });

  it('guards unsupported workspace workflows from repo-local fallback edits', () => {
    const guardedSkills: Array<[string, () => SkillTemplate, string]> = [
      ['compass-apply-change', getApplyChangeSkillTemplate, 'full workspace apply is not supported'],
      ['compass-sync-specs', getSyncSpecsSkillTemplate, 'workspace spec sync is not supported'],
      ['compass-archive-change', getArchiveChangeSkillTemplate, 'workspace archive is not supported'],
      ['compass-bulk-archive-change', getBulkArchiveChangeSkillTemplate, 'workspace bulk archive is not supported'],
      ['compass-verify-change', getVerifyChangeSkillTemplate, 'full workspace implementation verification is not supported'],
    ];

    for (const [dirName, createTemplate, guardText] of guardedSkills) {
      const content = generateSkillContent(createTemplate(), 'PARITY-BASELINE');

      expect(content, dirName).toContain('actionContext.mode: "workspace-planning"');
      expect(content, dirName).toContain(guardText);
      expect(content, dirName).not.toContain('compass/changes/<name>');
      expect(content, dirName).not.toContain('mv compass/changes');
    }
  });
});
