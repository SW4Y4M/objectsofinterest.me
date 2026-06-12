# Studio UX Redesign Design

Date: 2026-06-12
Source audit: `docs/audits/2026-06-12-studio-ux/audit-notes.md`
Status: Ready for review

## Goal

Improve the Studio screen's workflow and information structure so the owner can add, review, edit, replace images, and archive objects without scanning a long page of repeated form controls.

This is a UX-structure fix, not a visual redesign. Final styling, detailed component aesthetics, and polished Figma-driven UI are intentionally out of scope because those components will come later.

## Problem Summary

The current Studio is functionally complete, but it exposes the full add form and every edit form for every object at once. The audit found that this creates three main problems:

- Users cannot quickly distinguish adding a new object from managing existing objects.
- Existing objects are hard to scan because each one displays many fields and actions at all times.
- Mobile turns the Studio into a long repetitive form, making it hard to understand which controls belong to which object.

## UX Principles

1. **Show the object before its fields.**
   Studio should preserve the public wall's object-first mental model. Existing objects need thumbnails and compact identity before editable metadata.

2. **One focused edit task at a time.**
   The user should not see every field for every object by default. Editing should expand only the selected object.

3. **Separate creation from management.**
   Adding a new object and managing existing objects are different tasks and need distinct sections.

4. **Group actions by consequence.**
   Save, replace image, and archive should be visually and structurally tied to the object they affect. Destructive actions need extra friction or recovery.

5. **Use persistent feedback.**
   Validation, save success, replacement status, and archive outcomes should be visible in the page, not only through native browser bubbles or silent refreshes.

## Proposed Direction

Use a single Studio page with two zones:

1. **Add Object**
2. **Manage Objects**

The page remains one route at `/studio`. This avoids route complexity while fixing the audit's core density problem.

## Add Object Zone

### Default State

The add area should be compact by default.

Required visible content:

- Section heading: `Add object`
- Primary action to open the add form
- Optional short summary of what is needed: name, tag, image URL or upload

The full add form should be visible by default only if there are no objects yet. With existing objects present, it starts collapsed.

### Expanded Add Form

When expanded, the form should include the existing fields:

- Object name
- Editorial tag
- Image URL
- Image upload
- Source URL
- Price
- Currency
- Note/provenance

UX requirements:

- Keep visible labels for all fields.
- Do not rely on placeholder text as the only cue for price, currency, or note.
- Make it clear that image URL and image upload are alternatives.
- Show inline validation for required object name.
- Show persistent success feedback after a successful add.
- After adding an object, collapse the form or clear it and move the new object into the Manage Objects list.

## Manage Objects Zone

### Default Object List

Existing objects should render as compact object cards or rows. The final Figma components can decide the visual treatment; the UX structure should support either.

Each object summary must show:

- Thumbnail or current image preview
- Object name
- Editorial tag
- Status: Visible, Draft, or Archived
- Optional source/price summary when present
- Primary affordance to edit
- Secondary affordance to replace image
- Destructive affordance to archive when applicable

The default list must not show the full edit form for every object.

### Expanded Object Editor

Only one object editor should be expanded at a time. Opening one object should close any previously expanded editor.

Expanded editor fields:

- Name
- Editorial tag
- Source URL
- Price
- Currency
- Note/provenance

Requirements:

- Fields stay grouped under the object's thumbnail/name/status.
- Save action applies only to that object.
- Show persistent success or error feedback for that object.
- Unsaved changes should be visually indicated before switching objects. If the user opens another object with unsaved edits, the MVP behavior may discard local edits only if the interface makes that consequence clear.

### Image Replacement

Image replacement should be grouped with the same object, not visually separated into a parallel form column.

Required replacement controls:

- Current image preview
- Replacement image URL
- Replacement image upload
- Replace image action
- Replacement status or error feedback

The user should understand whether they are editing object metadata, replacing the image, or both.

### Archive

Archive must be treated as destructive.

MVP archive pattern:

- Use a two-step inline confirmation. First click reveals `Confirm archive`; second click submits the archive action.

Requirements:

- Archive action is clearly associated with one object.
- Archive is visually and structurally secondary to edit/save.
- The user can recover from accidental activation or must explicitly confirm before the change is applied.

## Mobile Behavior

Mobile should use the same compact-list model.

Requirements:

- Add Object appears first but does not permanently consume the whole workflow.
- Object summaries should be easy to scan vertically.
- Only one object should be expanded at a time.
- Replacement image controls and archive controls stay grouped under the active object.
- Touch targets should remain comfortable and not depend on tiny text links.

## Accessibility Requirements

The implementation should improve accessibility structure without claiming full compliance from this design alone.

Requirements:

- Use section headings for Add Object and Manage Objects.
- Use persistent labels for all visible fields.
- Avoid placeholder-only instructions.
- Use fieldsets or clearly grouped regions where helpful, especially for replacement image and destructive actions.
- Use inline errors connected to fields.
- Provide status messages for successful save, add, replace, and archive actions.
- Make repeated actions distinguishable by object name for assistive technology.
- Ensure keyboard users can open, edit, save, replace, and archive without losing context.

## Component Structure

This plan can be implemented by reshaping existing Studio components rather than changing the repository/data model.

Recommended component boundaries:

- `StudioToolbar` becomes the page shell for Add Object and Manage Objects.
- `AddObjectForm` gains collapsed/expanded behavior and inline validation display.
- `ObjectManagementList` renders compact object summaries.
- `ObjectManagementCard` or `ObjectManagementRow` owns one object's summary and expanded editor state.
- `ObjectMetadataForm` handles metadata editing.
- `ObjectImageReplacementForm` handles replacement image controls.
- `ArchiveObjectControl` handles confirmation or undo.
- `StudioFeedback` handles per-object and add-form success/error messages.

Naming can change during implementation if local conventions suggest better names.

## Data And Server Actions

The existing server actions can remain the primary write path:

- `addObject`
- `editObject`
- `replaceObjectImage`
- `archiveObject`

The UX redesign may require action return states or query/search params if persistent feedback cannot be handled with the current server action pattern.

Preferred behavior:

- Actions report success or validation failure back to the relevant form.
- Revalidation still updates the public wall and Studio.
- Mock mode remains supported.

## Out Of Scope

- Final visual styling or Figma component design
- New brand system, typography system, or color palette
- Full image search UX
- Bulk editing
- Drag-and-drop sorting
- Multi-user collaboration
- Separate object detail routes unless later requested
- Full WCAG certification

## Acceptance Criteria

1. Studio separates Add Object and Manage Objects into clear sections.
2. Existing objects are compact by default and include thumbnails.
3. Only one object editor is expanded at a time.
4. Metadata editing, image replacement, and archive controls are grouped under the relevant object.
5. Archive uses a two-step inline confirmation.
6. Add/edit/replace/archive flows provide persistent success or error feedback.
7. Mobile uses compact object summaries with one expanded editor at a time.
8. Placeholder-only field cues are replaced with visible labels or helper text.
9. Existing mock mode and live mode both work.
10. Tests cover the main Studio UX states: collapsed list, expanded editor, image replacement controls, archive safety, add validation, and mobile rendering.

## Suggested Implementation Slices

1. **Studio structure**
   Split the Studio screen into Add Object and Manage Objects sections without changing server actions.

2. **Compact object summaries**
   Add object cards/rows with thumbnails, name, tag, status, and action entry points.

3. **One-object expanded editor**
   Move metadata edit fields into an expandable editor and enforce one expanded object at a time.

4. **Grouped image replacement**
   Move replacement controls into the expanded object area with the current image preview.

5. **Safer archive**
   Add two-step inline confirmation for archive.

6. **Persistent feedback**
   Add inline validation and success/error messages for add, edit, replace, and archive actions.

7. **Mobile QA**
   Verify compact summaries and expanded editor behavior on mobile.

## Implementation Decisions

1. Add Object starts collapsed when one or more objects already exist. It can start open only for an empty Studio.
2. Archive uses two-step inline confirmation for MVP scope.
3. Expanded editor state lives in local component state. It does not need URL/search params or local storage for this iteration.
