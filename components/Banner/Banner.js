import { View, Text, StyleSheet, Dimensions, Image, Pressable } from 'react-native';
import React, { useState } from 'react';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { BannerData } from '../../data/BannerData';

const { width } = Dimensions.get('window');

const Banner = () => {
    const [currentPage, setCurrentPage] = useState(0);

    const renderItem = ({ item }) => (
        <View key={item.coverImageUri} style={styles.cardContainer}>
            <Pressable onPress={() => alert(item._id)}>
                <View style={styles.cardWrapper}>
                    <Image style={styles.card} source={{ uri: item.coverImageUri }} />
                    <View style={[styles.cornerLabel, { backgroundColor: item.cornerLabelColor }]}>
                        <Text style={styles.cornerLabelText}>{item.cornerLabelText}</Text>
                    </View>
                </View>
            </Pressable>
        </View>
    );

    return (
        <View style={styles.container}>
            <Carousel
                data={BannerData}
                renderItem={renderItem}
                sliderWidth={width}
                itemWidth={width}
                loop
                autoplay
                onSnapToItem={(index) => setCurrentPage(index)} // Update currentPage state
            />
            <Pagination
                dotsLength={BannerData.length}
                activeDotIndex={currentPage}
                containerStyle={{ paddingVertical: 8 }}
                dotStyle={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    marginHorizontal: 5,
                    backgroundColor: 'black',
                }}
                inactiveDotStyle={{
                    backgroundColor: '#c4c4c4',
                }}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.8}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        position:"relative"
    },
    cardContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width,
    },
    cardWrapper: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    card: {
        width: width * 1,
        height: width * 0.4,
    },
    cornerLabel: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        borderTopLeftRadius: 8,
    },
    cornerLabelText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 2,
        paddingBottom: 2,
    },
});

export default Banner;
