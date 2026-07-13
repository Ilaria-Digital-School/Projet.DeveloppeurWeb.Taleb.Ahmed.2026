const mongoose = require('mongoose');

const concertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Le titre du concert est requis'],
        trim: true
    },
    venue: {
        name: {
            type: String,
            required: [true, 'Le nom de la salle est requis']
        },
        address: {
            type: String,
            required: [true, 'L\'adresse est requise']
        },
        city: {
            type: String,
            required: [true, 'La ville est requise']
        },
        capacity: {
            type: Number,
            min: 0
        }
    },
    date: {
        type: Date,
        required: [true, 'La date du concert est requise']
    },
    time: {
        type: String,
        required: [true, 'L\'heure du concert est requise'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Veuillez entrer une heure valide (HH:MM)']
    },
    price: {
        min: {
            type: Number,
            min: 0,
            default: 0
        },
        max: {
            type: Number,
            min: 0
        },
        currency: {
            type: String,
            default: 'EUR'
        }
    },
    description: {
        type: String,
        maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    status: {
        type: String,
        enum: ['upcoming', 'sold_out', 'cancelled', 'completed'],
        default: 'upcoming'
    },
    ticketUrl: {
        type: String
    },
    infoUrl: {
        type: String
    },
    image: {
        type: String
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Virtual for formatted date
concertSchema.virtual('formattedDate').get(function() {
    return this.date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
});

// Virtual for formatted time
concertSchema.virtual('formattedTime').get(function() {
    return this.time;
});

// Index for performance
concertSchema.index({ date: 1 });
concertSchema.index({ status: 1 });
concertSchema.index({ 'venue.city': 1 });

// Ensure virtuals are included in JSON
concertSchema.set('toJSON', { virtuals: true });
concertSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Concert', concertSchema);
