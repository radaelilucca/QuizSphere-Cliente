import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, ActivityIndicator, } from 'react-native';
import Header from '../../components/Header';
import QuizCard from '../../components/QuizCard';
import api from '../../services/api';

export default function SharedQuizzes() {
    const isMounted = useRef();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        isMounted.current = true;

        loadQuizzes();
        return () => { isMounted.current = false }
    }, []);


    async function loadQuizzes(page=1) {
        try {
            setShowError(false);

            if (page===1) 
                setLoading(true);
            else 
                setLoadingMore(true);  

            const { data } = await api.get(`/shareQuiz?page=${page}`);

            if (isMounted.current) {
                if (page===1) // refreshing
                    setQuizzes(data.quizzes.docs);
                else // Loading more friends, so just add to the arrray
                    setQuizzes([...quizzes, ...data.quizzes.docs]);
                
                setTotalPages(data.quizzes.totalPages);
                setPage(page);
                setLoading(false); 
                setLoadingMore(false);
            }
        } catch (err) {
            console.log(err);
            if (isMounted.current) {
                setLoading(false);
                setLoadingMore(false);
                setShowError(true);
            }
        }
        
    }

    function loadMore() {
        if (page===totalPages) return;
        
        loadQuizzes(page+1);
    }
    
    function renderFooter() {
        if (loadingMore) {
            console.log(page===totalPages);
            return(
                <View style={{width : 100, height: 100, alignItems: 'center', justifyContent: 'center'}}>
                    <ActivityIndicator color="white" size="large"/>
                </View>
            )
        } 
        return null;
    }

    if (loading) {
        return(
            <View style={styles.container}>
                <Header screenTitle="Compartilhados comigo" />
                <ActivityIndicator size="large" color="white"/>
            </View>
        );
    }

    if (showError) {
        return(
            <View style={styles.container}>
                <Header screenTitle="Compartilhados comigo"/>
                <TouchableOpacity onPress={() => loadQuizzes()}>
                    <Text style={{ color: 'black' }}>Não foi possível buscar os quizzes. Tente novamente.</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return(
        <View style={styles.container}>
        <Header screenTitle="Compartilhados comigo"/>
            { 
            quizzes.length===0 &&
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 18 }}>Não há nada aqui 😅</Text>
            }      
            <FlatList 
                data={quizzes}
                onRefresh={loadQuizzes}
                refreshing={loading}
                style={{ width: '100%', paddingTop: 5, }}
                getItemLayout={(data, index) => (
                    {length: 160, offset: 160 * index, index}
                )}
                initialNumToRender={8}
                keyExtractor={item => item.quiz._id+item.user._id}
                contentContainerStyle={{ alignItems: 'center', }}
                renderItem={({item, index, separator}) => (
                    <View> 
                        <Text style={styles.userWhoShared}>{'Enviado por ' + item.user.userName}</Text>
                        <QuizCard data={item.quiz}/>
                    </View>
                )}
                ListFooterComponent={renderFooter}
                onEndReached={loadMore}
                onEndReachedThreshold={0.15}
                ListFooterComponentStyle={{marginBottom: 10}}
            />
            
        
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#3D6F95',
        alignItems: 'center',
    },
    userWhoShared: {
        color: 'white',
        // marginLeft: 20,
        textAlign: 'center',
    },
});