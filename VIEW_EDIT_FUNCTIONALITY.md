# View & Edit Functionality for Documents

## 📋 Overview

Added functionality to view and edit individual documents (EDPS, DVP, DFMEA) from the search results page using a dropdown menu.

## ✨ Features Implemented

### 1. **Dropdown Menu on Search Results**
- Added a three-dot menu button (⋮) on each document card
- Click the button to reveal options:
  - 👁️ **View** - Open document in read-only mode
  - ✏️ **Edit** - Open document in edit mode

### 2. **View Mode**
- All fields are **read-only** (grayed out, not editable)
- Upload image button is **hidden**
- Remove image buttons are **hidden**
- Top-right button shows **"Edit"** instead of **"Save"**
- Clicking **"Edit"** switches to edit mode

### 3. **Edit Mode**
- All fields are **editable**
- Can upload/remove images
- Top-right button shows **"Save"**
- Can save changes to the document

## 📁 Files Modified

### Frontend Components

#### **Search Component** (`frontend/src/pages/Search.tsx`)
- Added `onNavigate` prop to navigate to other pages with data
- Added dropdown menu state (`openMenuId`)
- Added click-outside handler to close menu
- Added `handleView()` and `handleEdit()` functions
- Updated result card to show dropdown menu with View/Edit options

#### **Search Styles** (`frontend/src/pages/Search.css`)
- Added `.result-menu-container` for positioning
- Added `.result-dropdown-menu` with slide-in animation
- Added `.dropdown-menu-item` with hover effects

#### **App Component** (`frontend/src/App.tsx`)
- Updated `handleNavigate()` to accept object data (not just strings)
- Added `pageData` state to store document data
- Updated `renderPage()` to pass `initialData` to flow components
- Updated Search component call to include `onNavigate` prop

#### **SummaryReview Component** (`frontend/src/components/SummaryReview.tsx`)
- Added `readOnly` prop to interface
- Updated all input/textarea/select fields to respect `readOnly`
- Added conditional rendering for Edit/Save button
- Hidden upload/remove buttons in read-only mode

#### **SummaryReview Styles** (`frontend/src/components/SummaryReview.css`)
- Added `.summary-edit-btn` styles matching Save button

#### **Flow Components**
- **EDPSFlow** (`frontend/src/pages/EDPSFlow.tsx`)
- **DVPFlow** (`frontend/src/pages/DVPFlow.tsx`)
- **DFMEAFlow** (`frontend/src/pages/DFMEAFlow.tsx`)

**Changes in all three:**
- Added `initialData` prop to interface
- Added `isViewMode` state
- Initialize form data from `initialData` if provided
- Start at `review` step when `initialData` is provided
- Updated `handleEditFromReview()` to toggle view/edit mode
- Passed `readOnly={isViewMode}` to SummaryReview

## 🎯 How to Use

### **For End Users:**

1. **Search for documents:**
   - Go to Search page
   - Find the document you want to view/edit

2. **View a document:**
   - Click the three-dot menu (⋮) on the right of the document card
   - Click **"👁️ View"**
   - Document opens in read-only mode
   - Click **"✏️ Edit"** button (top-right) to switch to edit mode

3. **Edit a document:**
   - Click the three-dot menu (⋮)
   - Click **"✏️ Edit"**
   - Document opens in edit mode
   - Make changes and click **"Save"**

4. **Switch between modes:**
   - **In View Mode:** Click **"Edit"** button to enable editing
   - **In Edit Mode:** Click **"←"** (back) button to return to search

## 🔄 Data Flow

```
Search Page
    ↓ (Click View/Edit)
App.tsx (handleNavigate with data)
    ↓
Flow Component (EDPSFlow/DVPFlow/DFMEAFlow)
    ↓ (initialData prop)
formData initialized with document data
    ↓
SummaryReview (readOnly prop)
    ↓
Fields rendered as read-only or editable
```

## 🎨 UI/UX Features

### **Dropdown Menu**
- Smooth slide-in animation
- Closes when clicking outside
- Hover effect on menu items
- Icons for better visual clarity

### **View Mode Indicators**
- Grayed out input fields
- "Not-allowed" cursor on hover
- Edit button prominently displayed
- No upload/delete actions available

### **Edit Mode**
- All fields editable
- Full functionality restored
- Save button available

## 🧪 Testing Checklist

- [ ] Search page loads correctly
- [ ] Three-dot menu appears on each document
- [ ] Clicking menu shows View/Edit options
- [ ] Clicking outside menu closes it
- [ ] **View mode:**
  - [ ] All fields are read-only
  - [ ] No upload/remove buttons
  - [ ] Edit button appears
  - [ ] Clicking Edit switches to edit mode
- [ ] **Edit mode:**
  - [ ] All fields are editable
  - [ ] Upload/remove buttons work
  - [ ] Save button appears
  - [ ] Can save changes
- [ ] Works for all document types (EDPS, DVP, DFMEA)
- [ ] Back button returns to search

## 🚀 Deployment

To deploy these changes:

```powershell
# Stop containers
docker-compose -f docker-compose.db.yml down

# Rebuild frontend with changes
docker-compose -f docker-compose.db.yml build --no-cache frontend

# Start everything
docker-compose -f docker-compose.db.yml up -d
```

## 📝 Notes

- View mode is **read-only** - no data can be modified
- Edit mode allows **full editing** capabilities
- Switching from View to Edit mode is seamless (no page reload)
- The back button (←) behavior depends on the mode:
  - **View mode:** Back button → Search page
  - **Edit mode:** Click back → Search page (or Edit button to enter edit mode)

## 🎉 Benefits

1. **Better UX:** Users can quickly preview documents before editing
2. **Safety:** View mode prevents accidental modifications
3. **Efficiency:** Direct access from search results
4. **Flexibility:** Easy toggle between view and edit modes
5. **Consistency:** Same pattern across all document types (EDPS, DVP, DFMEA)

