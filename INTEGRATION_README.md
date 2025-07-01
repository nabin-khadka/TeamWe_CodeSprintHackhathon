# AgroLink - Demand & Posting Integration

## Overview
Complete integration between frontend React Native app and backend Node.js API for demand posting and product listing functionality.

## Features Implemented

### Backend API Endpoints

#### Demands API (`/api/demands`)
- `POST /` - Create new demand (authenticated buyers)
- `GET /` - List all demands with filters (product type, status)
- `GET /my-demands` - Get buyer's own demands with responses
- `GET /:demandId` - Get single demand details
- `POST /:demandId/respond` - Sellers respond to demands
- `PATCH /:demandId` - Update demand status

#### Postings API (`/api/postings`)
- `POST /` - Create new posting (authenticated sellers)
- `GET /` - List all postings with filters (category, seller, search)
- `GET /:postingId` - Get single posting details
- `PUT /:postingId` - Update posting (seller only)
- `DELETE /:postingId` - Delete posting (seller only)

### Frontend Pages

#### For Buyers
- **Demand Page** (`/demand`) - Post new demands with location
- **My Demands** (`/my-demands`) - View posted demands and seller responses
- **Quick Actions** on home page for easy navigation

#### For Sellers
- **Post Product** (`/post-product`) - AI-enhanced product posting
- **View Demands** (`/view-demands`) - Browse and respond to buyer demands
- **My Products** (`/my-products`) - Manage posted products
- **Quick Actions** on home page for easy navigation

### Database Schema

#### Demand Model
```javascript
{
  buyerId: ObjectId (ref: User),
  productType: String (required),
  productName: String (required), 
  quantity: String (required),
  deliveryDate: String (required),
  deliveryLocation: String (required),
  coordinates: {
    latitude: Number (required),
    longitude: Number (required)
  },
  status: String (enum: active/fulfilled/cancelled),
  responses: [{
    sellerId: ObjectId (ref: User),
    message: String,
    price: Number,
    contactInfo: String,
    createdAt: Date
  }],
  createdAt: Date
}
```

#### Posting Model
```javascript
{
  sellerId: ObjectId (ref: User),
  title: String (required),
  description: String (required),
  price: Number (required),
  category: String (required),
  images: [String],
  active: Boolean (default: true),
  createdAt: Date
}
```

### Key Features

#### Authentication Integration
- All API calls use stored authentication tokens
- User type checking (buyer/seller permissions)
- Automatic redirect to login if not authenticated

#### Location Services
- GPS coordinate capture for demands
- Reverse geocoding for place names
- Location-based demand filtering

#### AI Integration
- Image recognition for product classification
- Automatic category detection
- Price suggestions based on product type

#### Real-time Updates
- Pull-to-refresh functionality
- Status updates for demands and postings
- Response notifications

#### User Experience
- Modern UI with consistent styling
- Form validation and error handling
- Loading states and success feedback
- Modal interfaces for complex interactions

## API Integration

### Authentication Headers
All authenticated requests include:
```
Authorization: <stored_user_token>
Content-Type: application/json
```

### Error Handling
- Comprehensive error catching and user feedback
- Network error handling
- Validation error display
- Token expiration handling

### Data Flow
1. **Create Demand/Posting** → API call → Database storage → Success feedback
2. **View Demands/Products** → API call → Data display → Refresh capability
3. **Respond to Demands** → API call → Update responses → Notify buyer
4. **Status Updates** → API call → Update database → Refresh lists

## Setup Instructions

### Backend
1. Install dependencies: `npm install`
2. Configure environment variables in `.env`
3. Start server: `npm start`

### Frontend  
1. Install dependencies: `npm install`
2. Configure API URL in environment
3. Start app: `expo start`

## Navigation Structure

### Buyer Flow
Home → Post Demand → My Demands → View Responses

### Seller Flow  
Home → View Demands → Respond → My Products → Post Product

## Security Features
- JWT token authentication
- User type authorization
- Owner verification for updates/deletes
- Input validation and sanitization

## Future Enhancements
- Real-time notifications
- Image upload to cloud storage
- Advanced filtering and search
- Rating and review system
- Order management integration
